<script lang="ts">
	import type {
		seat,
		seatCategory,
		ticketType as ticketTypeT,
		showing as showingT,
		priceSet as priceSetDb
	} from '$lib/server/db/schema';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { createSSEManager } from '$lib/utils/sseManager';
	import * as m from '$lib/paraglide/messages.js';
	import { refreshTimer } from '../../../lib/stores/cartTimeStore';

	// Types
	interface SeatStatus {
		status: 'available' | 'reserved' | 'paid';
		userId: string | null;
	}

	type Seat = typeof seat.$inferSelect & {
		status: SeatStatus['status'];
		userId: string | null;
		left: number;
		top: number;
		rotation: number;
		row?: string;
		seatNumber?: string;
		categoryId: number;
		booked?: boolean;
		reservedByUser?: boolean;
		reservedByOthers?: boolean;
		pending?: boolean;
	};

	type SeatCategory = typeof seatCategory.$inferSelect & {
		width?: number;
		height?: number;
		customPath?: string;
		color: string;
	};

	type PriceSet = typeof priceSetDb.$inferSelect;
	type Showing = typeof showingT.$inferSelect;
	type TicketType = typeof ticketTypeT.$inferSelect;

	interface SeatSelection {
		seat: Seat;
		seatCategory: SeatCategory;
		selectedTicketType: number;
	}

	// Props
	let { data } = $props<{ data: PageData }>();
	let showing: Showing = $state(data.showing!);
	let hall = $state(data.hall!);
	let seatCategories = $state<SeatCategory[]>(data.seatCategories!);
	let ticketTypes: TicketType[] = $state(data.ticketTypes!);
	let priceSet: PriceSet = $state(data.priceSet);

	// Local states
	let selectedSeats: SeatSelection[] = $state([]);
	let seats: Seat[] = $state([]);
	let error = $state('');

	// Derived total price
	let total = $derived(selectedSeats.reduce((sum, s) => sum + getTicketPrice(s), 0));

	// Reference for seat layout container
	let seatsContainerRef: HTMLDivElement;

	// SSE connection state
	let connectionStatus = $state<'connecting' | 'connected' | 'disconnected' | 'error' | 'failed'>(
		'disconnected'
	);
	let connectionError = $state<string | null>(null);
	let retryCount = $state(0);
	const MAX_RETRIES = 5;

	/**
	 * Compute the ticket price for one seat selection
	 */
	function getTicketPrice(selection: SeatSelection): number {
		const type = ticketTypes.find((t) => t.id === selection.selectedTicketType);
		const factor = Number(type?.factor ?? 0);
		const catPrice = Number(selection.seatCategory.price ?? 0);
		if (isNaN(factor) || isNaN(catPrice)) return 0;

		const basePrice = factor * catPrice;
		return basePrice * Number(priceSet.priceFactor);
	}

	/**
	 * Retrieve the width/height for a seat category
	 */
	function getBlockDimensions(categoryId: number) {
		const c = seatCategories.find((cat) => cat.id === categoryId);
		const width = c?.width ?? 40;
		const height = c?.height ?? 40;
		return { width, height };
	}

	/**
	 * Helper to transform server seat data into local seat objects
	 */
	function transformSeat(raw: Seat): Seat {
		const s: Seat = {
			...raw,
			booked: false,
			reservedByUser: false,
			reservedByOthers: false
		};
		if (s.status === 'paid') {
			s.booked = true;
		} else if (s.status === 'reserved') {
			const isCurrentUser = String(s.userId) === String(data.user?.id);
			if (isCurrentUser) {
				s.reservedByUser = true;
			} else {
				s.reservedByOthers = true;
				s.booked = true;
			}
		}
		return s;
	}

	/**
	 * Calculate bounding box of all seats
	 */
	function calculateSeatBounds() {
		return data.seats.reduce(
			(bounds, rawSeat) => {
				const dim = getBlockDimensions(rawSeat.categoryId);
				const right = Number(rawSeat.left) + dim.width;
				const bottom = Number(rawSeat.top) + dim.height;
				return {
					minX: Math.min(bounds.minX, Number(rawSeat.left)),
					maxX: Math.max(bounds.maxX, right),
					minY: Math.min(bounds.minY, Number(rawSeat.top)),
					maxY: Math.max(bounds.maxY, bottom)
				};
			},
			{ minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
		);
	}

	let layoutWidth = $state(0);
	let layoutHeight = $state(0);

	/**
	 * Center seats in the container
	 */
	function centerSeats() {
		if (!seatsContainerRef || !data.seats.length) return;
		const containerRect = seatsContainerRef.getBoundingClientRect();
		const bounds = calculateSeatBounds();

		layoutWidth = bounds.maxX - bounds.minX;
		layoutHeight = bounds.maxY - bounds.minY;

		const offsetX = (containerRect.width - layoutWidth) / 2;
		const offsetY = (containerRect.height - layoutHeight) / 2;

		seats = data.seats.map((raw) => {
			const s = { ...raw };
			s.left = Number(raw.left) - bounds.minX + offsetX;
			s.top = Number(raw.top) - bounds.minY + offsetY;
			return transformSeat(s);
		});
	}

	/**
	 * Toggle seat selection or cancellation
	 */
	async function toggleSeat(seat: Seat) {
		// If it's already booked by another user, do nothing
		if (seat.booked && !seat.reservedByUser) return;
		seat.pending = true;
		seats = seats.map((s) => (s.id === seat.id ? { ...seat } : s));

		const isSelected = selectedSeats.some((sel) => sel.seat.id === seat.id);
		if (isSelected) {
			// Cancel seat if currently selected
			const res = await cancelSeat(seat);
			if (res.type === 'error') {
				error = res.error || 'Failed to cancel seat';
				seat.pending = false;
				seats = seats.map((s) => (s.id === seat.id ? { ...seat } : s));
				return;
			}
			selectedSeats = selectedSeats.filter((sel) => sel.seat.id !== seat.id);
			return;
		}

		// Otherwise, reserve seat
		const res = await reserveSeat(seat);
		if (res.type === 'error') {
			error = res.error || 'Failed to reserve seat';
			seat.pending = false;
			seats = seats.map((s) => (s.id === seat.id ? { ...seat } : s));
			return;
		}
	}

	/**
	 * Cancel a seat reservation on server
	 */
	async function cancelSeat(seat: Seat) {
		const form = new FormData();
		form.append('showingId', showing.id.toString());
		form.append('seatId', seat.id.toString());
		const resp = await fetch('?/cancelSeat', { method: 'POST', body: form });
		return await resp.json();
	}

	/**
	 * Reserve a seat on server
	 */
	async function reserveSeat(seat: Seat) {
		const form = new FormData();
		form.append('showingId', showing.id.toString());
		form.append('seatId', seat.id.toString());
		form.append(
			'ticketType',
			selectedSeats.find((s) => s.seat.id === seat.id)?.selectedTicketType.toString() ||
				ticketTypes[0]?.id.toString()
		);
		const resp = await fetch('?/reserveSeat', { method: 'POST', body: form });
		return await resp.json();
	}

	/**
	 * Add seat to the local selectedSeats array
	 */
	function addSelectedSeat(seat: Seat) {
		const category = seatCategories.find((c) => c.id === seat.categoryId);
		if (!category) return;
		const defaultTicketType = ticketTypes[0]?.id;
		if (!Number.isInteger(defaultTicketType)) return;

		const newSeat = { ...seat };
		selectedSeats = [
			...selectedSeats,
			{ seat: newSeat, seatCategory: category, selectedTicketType: defaultTicketType }
		];
		seats = seats.map((s) => (s.id === seat.id ? newSeat : s));
	}

	/**
	 * Update ticket type for a seat
	 */
	function updateTicketType(seatId: number, ticketTypeId: number) {
		selectedSeats = selectedSeats.map((sel) => {
			if (sel.seat.id === seatId) {
				return { ...sel, selectedTicketType: ticketTypeId };
			}
			return sel;
		});
		reserveSeat(seats.find((s) => s.id === seatId)!);
	}

	/**
	 * Submit booking for all selected seats
	 */
	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (selectedSeats.length === 0) {
			error = 'Please select at least one seat.';
			return;
		}

		const form = new FormData();
		form.append('showingId', showing.id.toString());
		selectedSeats.forEach((s) => {
			form.append('seatIds', s.seat.id.toString());
			form.append('ticketTypes', s.selectedTicketType.toString());
			form.append('price', getTicketPrice(s).toString());
		});

		const resp = await fetch('?/bookSeats', { method: 'POST', body: form });
		if (resp.ok) {
			window.location.href = '/cart';
		} else {
			error = 'Failed to book seats. Please try again.';
		}
	}

	/**
	 * SSE Manager for realtime seat updates
	 */
	const sseManager = createSSEManager(
		showing.id,
		(seatStatusData) => {
			// If invalid data, skip
			if (!Array.isArray(seatStatusData)) return;

			// Transform seat data
			seats = seats.map((localSeat) => {
				const update = seatStatusData.find((st) => st.seatId === localSeat.id);
				if (!update) {
					return transformSeat({
						...localSeat,
						status: 'available',
						userId: null,
						pending: false
					});
				} else {
					return transformSeat({
						...localSeat,
						status: update.status as 'reserved' | 'paid',
						userId: update.userId,
						pending: false
					});
				}
			});

			// Filter out seats no longer reserved by the user
			selectedSeats = selectedSeats.filter((sel) => {
				const updated = seats.find((s) => s.id === sel.seat.id);
				return updated?.reservedByUser;
			});

			// If new seats appear as reservedByUser, add them to selectedSeats
			for (const seatObj of seats) {
				if (seatObj.reservedByUser && !selectedSeats.some((sel) => sel.seat.id === seatObj.id)) {
					addSelectedSeat(seatObj);
				}
			}

			refreshTimer();
		},
		(status) => {
			connectionStatus = status.connectionStatus;
			connectionError = status.connectionError;
			retryCount = status.retryCount;
		}
	);

	/**
	 * Retry SSE connection manually
	 */
	function manualRetryConnection() {
		sseManager.reconnect();
	}

	/**
	 * Lifecycle: On Mount
	 */
	onMount(() => {
		centerSeats();
		sseManager.connect();

		// Re-select seats the user had in a reserved state
		if (data.userReservedSeats) {
			selectedSeats = data.userReservedSeats.map((res) => {
				const seatObj = seats.find((s) => s.id === res.seatId)!;
				const category = seatCategories.find((c) => c.id === seatObj.categoryId)!;
				return {
					seat: seatObj,
					seatCategory: category,
					selectedTicketType: res.type || ticketTypes[0]?.id || 0
				};
			});
		}

		return () => {
			sseManager.disconnect();
		};
	});

	/**
	 * Helper: returns only ticket types allowed for the current price set
	 */
	function getAvailableTicketTypes(): TicketType[] {
		return ticketTypes.filter((type) => priceSet.ticketTypes.includes(type.id));
	}

	/**
	 * Formats a price (single seat + factor) for display
	 */
	function getFormattedPrice(categoryId: number, typeId: number): string {
		const category = seatCategories.find((c) => c.id === categoryId);
		const type = ticketTypes.find((t) => t.id === typeId);
		if (!category || !type) return '0.00';

		const price = Number(category.price) * Number(type.factor) * Number(priceSet.priceFactor);
		return price.toFixed(2);
	}

	/**
	 * Checks if a seat category is included in the price set
	 */
	function isCategoryAllowed(categoryId: number): boolean {
		return priceSet.seatCategoryPrices.includes(categoryId);
	}
</script>

<!-- Main Layout -->
<div class="mx-auto w-full max-w-[1400px] p-4">
	<!-- Display error if any -->
	{#if error}
		<div class="mb-4 text-red-500">{error}</div>
	{/if}

	<!-- Header with showing/hall info -->
	<div class="mb-8 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
		<div class="flex flex-col items-start justify-between p-6 md:flex-row md:items-center">
			<div>
				<h1 class="mb-2 text-3xl font-bold">{m.seat_selection({})}</h1>
				<div class="flex flex-col md:flex-row md:gap-8">
					<div class="flex items-center gap-2">
						<span class="text-gray-600">{m.showing({})}</span>
						<span class="font-semibold">{showing.date}</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-gray-600">{m.hall({})}</span>
						<span class="font-semibold">{hall.name}</span>
					</div>
				</div>
			</div>
			<div class="mt-4 text-right md:mt-0">
				<div class="text-sm text-gray-600">{m.total_price({})}</div>
				<div class="text-2xl font-bold">{total.toFixed(2)}€</div>
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-8 lg:flex-row">
		<!-- Left column: Selected seats summary & Legend -->
		<div class="order-2 w-full lg:order-1 lg:w-80 lg:flex-shrink-0">
			<!-- Selected seats summary -->
			<div class="rounded-lg bg-white p-4 shadow">
				<h3 class="mb-4 text-xl font-bold">{m.selected_seats({})}</h3>

				{#if selectedSeats.length > 0}
					<div class="space-y-4">
						{#each selectedSeats as sel}
							<div class="rounded-lg border bg-white p-3">
								<div class="mb-2 flex justify-between">
									<span class="font-bold">
										{sel.seat.row}{sel.seat.seatNumber}
									</span>
									<span class="text-gray-600">{sel.seatCategory.name}</span>
								</div>
								<div class="flex items-center justify-between">
									<select
										class="rounded border p-1 text-sm"
										value={sel.selectedTicketType}
										onchange={(e) =>
											updateTicketType(sel.seat.id, Number(e.currentTarget.value))
										}
									>
										{#each getAvailableTicketTypes() as tt}
											<option value={tt.id}>
												{tt.name} (€{getFormattedPrice(sel.seatCategory.id, tt.id)})
											</option>
										{/each}
									</select>
									<span class="font-bold">€{getTicketPrice(sel).toFixed(2)}</span>
								</div>
							</div>
						{/each}
					</div>

					<!-- Booking button -->
					<div class="mt-6 border-t pt-4">
						<div class="mb-4 flex justify-between">
							<span class="font-bold">{m.sum({})}</span>
							<span class="text-xl font-bold">€{total.toFixed(2)}</span>
						</div>
						<button
							onclick={handleSubmit}
							class="w-full rounded bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700"
						>
							{m.book_seats({})}
						</button>
					</div>
				{:else}
					<p class="text-gray-500">{m.no_seats_selected({})}</p>
				{/if}
			</div>

			<!-- Legend -->
			<div class="mt-4 rounded-lg bg-white p-4 shadow">
				<h4 class="mb-3 font-bold">{m.legend({})}</h4>
				<div class="grid grid-cols-2 gap-3">
					{#each seatCategories as cat}
						<div class="flex items-center gap-2">
							<div
								class="h-4 w-4 rounded"
								style="background-color: {cat.color}"
							></div>
							<span class="text-sm">{cat.name}</span>
						</div>
					{/each}
					<div class="flex items-center gap-2">
						<div class="h-4 w-4 rounded bg-gray-500"></div>
						<span class="text-sm">{m.paid({})}</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="h-4 w-4 rounded bg-yellow-400"></div>
						<span class="text-sm">{m.reserved({})}</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="h-4 w-4 rounded bg-green-500"></div>
						<span class="text-sm">{m.selected({})}</span>
					</div>
				</div>
			</div>

			<!-- Price overview -->
			<div class="mt-4 rounded-lg bg-white p-4 shadow">
				<h4 class="mb-3 font-bold">{m.price_overview({})}</h4>
				<div class="space-y-2">
					{#each seatCategories.filter((cat) => isCategoryAllowed(cat.id)) as category}
						<div class="text-sm">
							<div class="font-semibold">{category.name}</div>
							<div class="ml-2 space-y-1">
								{#each getAvailableTicketTypes() as type}
									<div class="flex justify-between">
										<span>{type.name}:</span>
										<span>{getFormattedPrice(category.id, type.id)}€</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
				{#if Number(priceSet.priceFactor) !== 1}
					<div class="mt-2 text-xs text-gray-500">
						{m.price_markup({ 0: ((Number(priceSet.priceFactor) - 1) * 100).toFixed(0) })}
					</div>
				{/if}
			</div>
		</div>

		<!-- Right column: Seat layout -->
		<div class="order-1 flex-grow overflow-auto lg:order-2">
			<div class="relative" style="min-width: {layoutWidth + 40}px">
				<!-- SSE connection dot (top-right corner) -->
				<div class="absolute right-2 top-2 group z-10">
					<!-- Dot changes color based on connectionStatus -->
					<div
						class="h-3 w-3 rounded-full"
						class:bg-green-500={connectionStatus === 'connected'}
						class:bg-yellow-400={connectionStatus === 'connecting'}
						class:bg-red-500={
							connectionStatus === 'disconnected' ||
							connectionStatus === 'error' ||
							connectionStatus === 'failed'
						}
					></div>

					<!-- Tooltip on hover -->
					<div
						class="absolute right-0 mt-1 hidden w-max rounded-md bg-gray-800 px-2 py-1 text-xs text-white group-hover:block"
					>
						{#if connectionStatus === 'connecting'}
							<span>Connecting...</span>
						{:else if connectionStatus === 'connected'}
							<span>Connected</span>
						{:else if connectionStatus === 'disconnected'}
							<span class="flex items-center gap-1">
								Disconnected
								<button
									class="rounded bg-blue-600 px-1 py-0.5 text-xs text-white"
									onclick={manualRetryConnection}
								>
									Retry
								</button>
							</span>
						{:else if connectionStatus === 'error'}
							<span class="flex flex-col items-start gap-1">
								<span>Error: {connectionError}</span>
								<button
									class="rounded bg-blue-600 px-1 py-0.5 text-xs text-white"
									onclick={manualRetryConnection}
								>
									Retry
								</button>
							</span>
						{:else if connectionStatus === 'failed'}
							<span class="flex flex-col items-start gap-1">
								<span>Failed after {retryCount} retries</span>
								<button
									class="rounded bg-blue-600 px-1 py-0.5 text-xs text-white"
									onclick={manualRetryConnection}
								>
									Retry
								</button>
							</span>
						{/if}
					</div>
				</div>

				<!-- Main seat container -->
				<div class="h-full w-full rounded-lg bg-gray-100">
					<div
						bind:this={seatsContainerRef}
						class="relative"
						style="min-height: 600px; height: calc(100vh - 300px);"
					>
						<!-- Screen / stage -->
						<div class="absolute left-0 right-0 top-8">
							<div class="mx-auto" style="width: {layoutWidth}px">
								<div class="h-2 w-full -skew-y-1 transform rounded-lg bg-black shadow-md"></div>
								<p class="mt-2 text-center text-sm text-gray-500">{m.screen({})}</p>
							</div>
						</div>

						<!-- Actual seats -->
						{#each seats as seat (seat.id)}
							{@const category = seatCategories.find((c) => c.id === seat.categoryId)}
							{@const dims = getBlockDimensions(seat.categoryId)}

							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="absolute flex items-center justify-center rounded transition-colors duration-200"
								class:cursor-pointer={!seat.booked || seat.reservedByUser}
								class:cursor-not-allowed={seat.booked && !seat.reservedByUser}
								class:pending={seat.pending}
								style="
									left: {seat.left}px;
									top: {seat.top}px;
									width: {dims.width}px;
									height: {dims.height}px;
									transform: rotate({seat.rotation}deg);
								"
								onclick={() => toggleSeat(seat)}
							>
								{#if seat.pending}
									<!-- Pending / loading spinner -->
									<svg
										class="h-6 w-6 animate-spin text-blue-600"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										/>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
								{:else}
									{#if category?.customPath}
										<!-- If there's a custom SVG path defined for this category -->
										<svg
											width={dims.width}
											height={dims.height}
											viewBox="0 0 {dims.width} {dims.height}"
										>
											<path
												d={category.customPath}
												fill={
													seat.status === 'paid'
														? '#9CA3AF' /* paid => grey */
														: seat.reservedByOthers
														? '#FCD34D' /* reserved => yellow */
														: seat.reservedByUser
														? '#10B981' /* selected => green */
														: category.color /* default */
												}
												stroke="white"
												stroke-width="1"
											/>
										</svg>
									{/if}
									{#if seat.row && seat.seatNumber}
										<div
											class="absolute bottom-0 right-0 rounded-tl bg-black bg-opacity-50 px-1 py-0.5 text-xs text-white"
										>
											{seat.row}{seat.seatNumber}
										</div>
									{/if}
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.pending {
		opacity: 0.7;
		pointer-events: none;
	}
</style>
