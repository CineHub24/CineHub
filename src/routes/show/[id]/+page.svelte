<script lang="ts">
	/*************************************************************
	 *           IMPORTS UND TYPEN
	 *************************************************************/
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

		booked?: boolean; // = true, wenn entweder paid oder von jemand anderem reserviert
		reservedByUser?: boolean; // = true, wenn currentUser diesen Sitz reserviert hat
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

	/*************************************************************
	 *           PROP & ZUSTÄNDE
	 *************************************************************/
	let { data } = $props<{ data: PageData }>();

	let showing: Showing = $state(data.showing!);
	let hall = $state(data.hall!);
	let seatCategories = $state<SeatCategory[]>(data.seatCategories!);
	let ticketTypes: TicketType[] = $state(data.ticketTypes!);
	let priceSet: PriceSet = $state(data.priceSet);

	// Lokale States
	let selectedSeats: SeatSelection[] = $state([]);
	let seats: Seat[] = $state([]); // nach centerSeats() + transformSeat() befüllt
	let error = $state('');

	// Ticket-Gesamtpreis
	let total = $derived(selectedSeats.reduce((sum, s) => sum + getTicketPrice(s), 0));

	// Referenz auf das HTML-Element, das den Sitzplan umgibt (für Zentrierung)
	let seatsContainerRef: HTMLDivElement;

	// SSE-Status
	let connectionStatus = $state<'connecting' | 'connected' | 'disconnected' | 'error' | 'failed'>(
		'disconnected'
	);
	let connectionError = $state<string | null>(null);
	let retryCount = $state(0);
	const MAX_RETRIES = 5;

	/*************************************************************
	 *           FUNKTIONEN: PRICE & DIMENSIONS
	 *************************************************************/
	function getTicketPrice(selection: SeatSelection): number {
		const type = ticketTypes.find((t) => t.id === selection.selectedTicketType);
		const factor = Number(type?.factor ?? 0);
		const catPrice = Number(selection.seatCategory.price ?? 0);

		if (isNaN(factor) || isNaN(catPrice)) return 0;

		const basePrice = factor * catPrice;
		const finalPrice = basePrice * Number(priceSet.priceFactor);

		// console.log(
		// 	`[getTicketPrice] SeatID=${selection.seat.id}, 
        //  TicketType=${type?.name}, 
        //  BasePrice=${basePrice},
        //  PriceFactor=${priceSet.priceFactor},
        //  FinalPrice=${finalPrice}`
		// );

		return finalPrice;
	}
	function getBlockDimensions(categoryId: number) {
		const c = seatCategories.find((cat) => cat.id === categoryId);
		const width = c?.width ?? 40;
		const height = c?.height ?? 40;
		// Wir loggen nicht jedes Mal, da es oft aufgerufen wird
		return { width, height };
	}

	/*************************************************************
	 *           FUNKTION: SITZ-TRANSFORMATION
	 *************************************************************/
	function transformSeat(raw: Seat): Seat {
		// console.log(`[transformSeat] Processing seat ${raw.id}:`, {
		// 	status: raw.status,
		// 	userId: raw.userId,
		// 	currentUser: data.user?.id
		// });

		const s: Seat = {
			...raw,
			booked: false,
			reservedByUser: false,
			reservedByOthers: false
		};

		if (s.status === 'paid') {
			s.booked = true;
		} else if (s.status === 'reserved') {
			// Wichtig: Stellen Sie sicher, dass beide IDs als Strings verglichen werden
			const isCurrentUser = String(s.userId) === String(data.user?.id);
			if (isCurrentUser) {
				s.reservedByUser = true;
				// Wichtig: Nicht als 'booked' markieren wenn es vom current user ist
			} else {
				s.reservedByOthers = true;
				s.booked = true;
			}
		}

		// console.log(`[transformSeat] Result for seat ${s.id}:`, {
		// 	reservedByUser: s.reservedByUser,
		// 	reservedByOthers: s.reservedByOthers,
		// 	booked: s.booked
		// });

		return s;
	}

	/*************************************************************
	 *           FUNKTION: SITZPLAN-ZENTRIERUNG
	 *************************************************************/
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

	function centerSeats() {
		if (!seatsContainerRef || !data.seats.length) return;

		const containerRect = seatsContainerRef.getBoundingClientRect();
		const bounds = calculateSeatBounds();

		// Setze die Breite für die Leinwand
		layoutWidth = bounds.maxX - bounds.minX;
		layoutHeight = bounds.maxY - bounds.minY;

		// Calculate offsets to center the entire seat layout
		const offsetX = (containerRect.width - layoutWidth) / 2;
		const offsetY = (containerRect.height - layoutHeight) / 2;

		seats = data.seats.map((raw) => {
			const s = { ...raw };
			s.left = Number(raw.left) - bounds.minX + offsetX;
			s.top = Number(raw.top) - bounds.minY + offsetY;
			return transformSeat(s);
		});
	}

	/*************************************************************
	 *           FUNKTION: SITZ TOGGLEN & RESERVIEREN
	 *************************************************************/
	async function toggleSeat(seat: Seat) {
		// console.log(
		// 	`[toggleSeat] clicked seatID=${seat.id}, booked=${seat.booked}, reservedByUser=${seat.reservedByUser}`
		// );
		// Falls Sitz bezahlt/gebucht ist, aber nicht vom aktuellen User => no action
		if (seat.booked && !seat.reservedByUser) {
			// console.log(' -> seat is booked but not by me. Doing nothing.');
			return;
		}

		seat.pending = true;
		seats = seats.map((s) => (s.id === seat.id ? { ...seat } : s));

		// Prüfen, ob dieser Sitz schon in selectedSeats ist
		const isSelected = selectedSeats.some((sel) => sel.seat.id === seat.id);
		if (isSelected) {
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

		// Andernfalls versuchen wir, den Sitz auf dem Server zu reservieren
		// console.log(`[toggleSeat] seat not selected yet. Reserving seatID=${seat.id}...`);
		const res = await reserveSeat(seat);
		if (res.type === 'error') {
			error = res.error || 'Failed to reserve seat';
			seat.pending = false;
			seats = seats.map((s) => (s.id === seat.id ? { ...seat } : s));
			return;
		}
		// seats = seats.map((s) => (s.id === seat.id ? { ...seat, pending: false } : s));
	}

	async function cancelSeat(seat: Seat) {
		// console.log(`[cancelSeat] seatID=${seat.id}`);
		const form = new FormData();
		form.append('showingId', showing.id.toString());
		form.append('seatId', seat.id.toString());

		const resp = await fetch('?/cancelSeat', {
			method: 'POST',
			body: form
		});
		const json = await resp.json();
		// console.log('[cancelSeat] server response:', json);
		return json;
	}

	async function reserveSeat(seat: Seat) {
		// console.log(`[reserveSeat] sending request to reserve seatID=${seat.id}`);
		const form = new FormData();
		form.append('showingId', showing.id.toString());
		form.append('seatId', seat.id.toString());
		form.append(
			'ticketType',
			selectedSeats.find((s) => s.seat.id === seat.id)?.selectedTicketType.toString() || ticketTypes[0]?.id.toString()	// default ticket type for first selection
		);

		const resp = await fetch('?/reserveSeat', {
			method: 'POST',
			body: form
		});
		const json = await resp.json();
		// console.log('[reserveSeat] server response:', json);
		return json;
	}

	function addSelectedSeat(seat: Seat) {
		// console.log(`[addSelectedSeat] seatID=${seat.id}`);
		const category = seatCategories.find((c) => c.id === seat.categoryId);
		if (!category) {
			// console.error(`[addSelectedSeat] No category found for seatID=${seat.id}`);
			return;
		}
		const defaultTicketType = ticketTypes[0]?.id;
		if (!Number.isInteger(defaultTicketType)) {
			// console.error('[addSelectedSeat] No valid default ticket type found');
			return;
		}

		const newSeat = { ...seat };
		selectedSeats = [
			...selectedSeats,
			{
				seat: newSeat,
				seatCategory: category,
				selectedTicketType: defaultTicketType
			}
		];

		seats = seats.map((s) => (s.id === seat.id ? newSeat : s));
		// console.log('[addSelectedSeat] selectedSeats now:', selectedSeats);
	}

	function updateTicketType(seatId: number, ticketTypeId: number) {
		// console.log(`[updateTicketType] seatID=${seatId}, newTicketType=${ticketTypeId}`);

		selectedSeats = selectedSeats.map((sel) => {
			if (sel.seat.id === seatId) {
				return { ...sel, selectedTicketType: ticketTypeId };
			}
			return sel;
		});

		reserveSeat(seats.find((s) => s.id === seatId)!);
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		// console.log(
		// 	'[handleSubmit] Booking seats:',
		// 	selectedSeats.map((s) => s.seat.id)
		// );

		if (selectedSeats.length === 0) {
			error = 'Please select at least one seat.';
			// console.warn('[handleSubmit] No seats selected => error');
			return;
		}

		const form = new FormData();
		form.append('showingId', showing.id.toString());
		selectedSeats.forEach((s) => {
			form.append('seatIds', s.seat.id.toString());
			form.append('ticketTypes', s.selectedTicketType.toString());
			form.append('price', getTicketPrice(s).toString());
		});

		const resp = await fetch('?/bookSeats', {
			method: 'POST',
			body: form
		});

		if (resp.ok) {
			// console.log('[handleSubmit] Booking success! Redirecting to /cart...');
			window.location.href = '/cart';
		} else {
			error = 'Failed to book seats. Please try again.';
			// console.warn('[handleSubmit] Booking failed:', error);
		}
	}

	const sseManager = createSSEManager(
		showing.id,
		// Callback für eingehende Sitz-Updates
		(seatStatusData) => {
			console.log('[SSE] got seat update:', seatStatusData);

			if (!Array.isArray(seatStatusData)) {
				// console.error('[SSE] invalid seat status data:', seatStatusData);
				return;
			}

			/**
			 * seatStatusData enthält (seatId, status, userId) NUR für reservierte/bezahlt seats
			 * => Alle seats, die NICHT in seatStatusData auftauchen, sind "available"
			 */
			const updatedSeatIds = new Set(seatStatusData.map((st) => st.seatId));

			seats = seats.map((localSeat) => {
				const update = seatStatusData.find((st) => st.seatId === localSeat.id);

				if (!update) {
					// Not in the server response => seat is "available"
					return transformSeat({
						...localSeat,
						status: 'available',
						userId: null,
						pending: false // reset pending
					});
				} else {
					// seat is either reserved or paid
					return transformSeat({
						...localSeat,
						status: update.status as 'reserved' | 'paid',
						userId: update.userId,
						pending: false // reset pending
					});
				}
			});

			selectedSeats = selectedSeats.filter((sel) => {
				const updated = seats.find((s) => s.id === sel.seat.id);
				return updated?.reservedByUser;
			});

			// optional: neu "reservedByUser" seats hinzufügen
			for (const seatObj of seats) {
				if (seatObj.reservedByUser && !selectedSeats.some((sel) => sel.seat.id === seatObj.id)) {
					addSelectedSeat(seatObj);
				}
			}

			console.log('[SSE] seats after update:', seats);
			console.log('[SSE] selectedSeats after update:', selectedSeats);
		},
		// Callback für Verbindungsstatus
		(status) => {
			connectionStatus = status.connectionStatus;
			connectionError = status.connectionError;
			retryCount = status.retryCount;
			console.log('[SSE] Connection status changed:', status);
		}
	);

	function manualRetryConnection() {
		// console.log('Manual SSE reconnect requested');
		sseManager.reconnect();
	}

	/*************************************************************
	 *           ONMOUNT
	 *************************************************************/
	onMount(() => {
		// console.log('[onMount] data:', data);
		// console.log(`[onMount] userId = ${data.user?.id}`);

		// 1) Seats zentrieren (und transformieren)
		centerSeats();

		// 2) SSE-Verbindung starten
		sseManager.connect();

		// 3) Falls der User bereits reservierte Seats in userReservedSeats hatte
		if (data.userReservedSeats) {
			// console.log('[onMount] userReservedSeats vorhanden:', data.userReservedSeats);

			selectedSeats = data.userReservedSeats.map((res) => {
				// Passender Eintrag in seats-Array
				const seatObj = seats.find((s) => s.id === res.seatId)!;
				const category = seatCategories.find((c) => c.id === seatObj.categoryId)!;

				// console.log(`[onMount] Marking seatID=${seatObj.id} as selected (already reserved)`);

				return {
					seat: seatObj,
					seatCategory: category,
					selectedTicketType: res.type || ticketTypes[0]?.id || 0
				};
			});

			// console.log('[onMount] selectedSeats now:', selectedSeats);
		}

		// Cleanup, wenn das Component unmountet
		return () => {
			// console.log('[onMount -> Unmount] Disconnecting SSE');
			sseManager.disconnect();
		};
	});

	function getAvailableTicketTypes(): TicketType[] {
		return ticketTypes.filter((type) => priceSet.ticketTypes.includes(type.id));
	}

	function getFormattedPrice(categoryId: number, typeId: number): string {
		const category = seatCategories.find((c) => c.id === categoryId);
		const type = ticketTypes.find((t) => t.id === typeId);

		if (!category || !type) return '0.00';

		const price = Number(category.price) * Number(type.factor) * Number(priceSet.priceFactor);
		return price.toFixed(2);
	}

	function isCategoryAllowed(categoryId: number): boolean {
		return priceSet.seatCategoryPrices.includes(categoryId);
	}
</script>

<div class="mx-auto w-full max-w-[1400px] p-4">
	<!-- Error Message -->
	{#if error}
		<div class="mb-4 text-red-500">{error}</div>
	{/if}

	<!-- Header with Show Info -->
	<div class="mb-8 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
		<div class="flex flex-col items-start justify-between p-6 md:flex-row md:items-center">
			<div>
				<h1 class="mb-2 text-3xl font-bold">Sitzplatzauswahl</h1>
				<div class="flex flex-col md:flex-row md:gap-8">
					<div class="flex items-center gap-2">
						<span class="text-gray-600">Vorstellung:</span>
						<span class="font-semibold">{showing.date}</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-gray-600">Saal:</span>
						<span class="font-semibold">{hall.name}</span>
					</div>
				</div>
			</div>
			<div class="mt-4 text-right md:mt-0">
				<div class="text-sm text-gray-600">Gesamtpreis</div>
				<div class="text-2xl font-bold">${total.toFixed(2)}</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="flex flex-col gap-8 lg:flex-row">
		<!-- Left Side: Summary -->
		<div class="order-2 w-full lg:order-1 lg:w-80 lg:flex-shrink-0">
			<div class="rounded-lg bg-white p-4 shadow">
				<h3 class="mb-4 text-xl font-bold">Ausgewählte Sitze</h3>

				{#if selectedSeats.length > 0}
					<div class="space-y-4">
						{#each selectedSeats as sel}
							<div class="rounded-lg border bg-white p-3">
								<div class="mb-2 flex justify-between">
									<span class="font-bold">
										{sel.seat.row}{sel.seat.seatNumber}
									</span>
									<span class="text-gray-600">
										{sel.seatCategory.name}
									</span>
								</div>
								<div class="flex items-center justify-between">
									<select
										class="rounded border p-1 text-sm"
										value={sel.selectedTicketType}
										onchange={(e) => updateTicketType(sel.seat.id, Number(e.currentTarget.value))}
									>
										{#each getAvailableTicketTypes() as tt}
											<option value={tt.id}>
												{tt.name} (${getFormattedPrice(sel.seatCategory.id, tt.id)})
											</option>
										{/each}
									</select>
									<span class="font-bold">${getTicketPrice(sel).toFixed(2)}</span>
								</div>
							</div>
						{/each}
					</div>

					<div class="mt-6 border-t pt-4">
						<div class="mb-4 flex justify-between">
							<span class="font-bold">Summe:</span>
							<span class="text-xl font-bold">${total.toFixed(2)}</span>
						</div>
						<button
							onclick={handleSubmit}
							class="w-full rounded bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700"
						>
							Sitze buchen
						</button>
					</div>
				{:else}
					<p class="text-gray-500">Keine Sitze ausgewählt</p>
				{/if}
			</div>

			<!-- Legend -->
			<div class="mt-4 rounded-lg bg-white p-4 shadow">
				<h4 class="mb-3 font-bold">Legende</h4>
				<div class="grid grid-cols-2 gap-3">
					{#each seatCategories as cat}
						<div class="flex items-center gap-2">
							<div class="h-4 w-4 rounded" style="background-color: {cat.color}"></div>
							<span class="text-sm">{cat.name}</span>
						</div>
					{/each}
					<div class="flex items-center gap-2">
						<div class="h-4 w-4 rounded bg-gray-500"></div>
						<span class="text-sm">Bezahlt</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="h-4 w-4 rounded bg-yellow-400"></div>
						<span class="text-sm">Reserviert</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="h-4 w-4 rounded bg-green-500"></div>
						<span class="text-sm">Ausgewählt</span>
					</div>
				</div>
			</div>

			<!-- Price Overview -->
			<div class="mt-4 rounded-lg bg-white p-4 shadow">
				<h4 class="mb-3 font-bold">Preisübersicht</h4>
				<div class="space-y-2">
					{#each seatCategories.filter((cat) => isCategoryAllowed(cat.id)) as category}
						<div class="text-sm">
							<div class="font-semibold">{category.name}</div>
							<div class="ml-2 space-y-1">
								{#each getAvailableTicketTypes() as type}
									<div class="flex justify-between">
										<span>{type.name}:</span>
										<span>${getFormattedPrice(category.id, type.id)}</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
				{#if Number(priceSet.priceFactor) !== 1}
					<div class="mt-2 text-xs text-gray-500">
						* Preise inkl. {((Number(priceSet.priceFactor) - 1) * 100).toFixed(0)}% Aufschlag
					</div>
				{/if}
			</div>
		</div>

		<!-- Right Side: Seat Layout -->
		<div class="order-1 flex-grow overflow-auto lg:order-2">
			<!-- Scrollable Container -->
			<div class="relative" style="min-width: {layoutWidth + 40}px">
				<!-- Grauer Hintergrund-Container -->
				<div class="h-full w-full rounded-lg bg-gray-100">
					<!-- Wrapper div für Leinwand + Sitze -->
					<div
						bind:this={seatsContainerRef}
						class="relative"
						style="min-height: 600px; height: calc(100vh - 300px);"
					>
						<!-- Screen -->
						<div class="absolute left-0 right-0 top-8">
							<div class="mx-auto" style="width: {layoutWidth}px">
								<div class="h-2 w-full -skew-y-1 transform rounded-lg bg-black shadow-md"></div>
								<p class="mt-2 text-center text-sm text-gray-500">Leinwand</p>
							</div>
						</div>
						<!-- Seats -->
						{#each seats as seat (seat.id)}
							{@const category = seatCategories.find((c) => c.id === seat.categoryId)}
							{@const dims = getBlockDimensions(seat.categoryId)}

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
								{#if category?.customPath}
									<svg
										width={dims.width}
										height={dims.height}
										viewBox="0 0 {dims.width} {dims.height}"
									>
										<path
											d={category.customPath}
											fill={seat.status === 'paid'
												? '#9CA3AF'
												: seat.reservedByOthers
													? '#FCD34D'
													: seat.reservedByUser
														? '#10B981'
														: category.color}
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
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.05);
			opacity: 0.7;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
