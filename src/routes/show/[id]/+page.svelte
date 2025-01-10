<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import type { seat, seatCategory, ticketType as ticketTypesT, showing as showingT, cinemaHall as hallT } from '$lib/server/db/schema';
	import type { Ticket } from 'lucide-svelte';

	type SeatType = typeof seat.$inferSelect;
	type Seat = SeatType & { booked?: boolean }
	type SeatCategory = typeof seatCategory.$inferSelect;
	type Showing = typeof showingT.$inferSelect;
	type TicketType = typeof ticketTypesT.$inferSelect;
	type HallType = typeof hallT.$inferSelect;
	interface SeatResponse {
		seat: Seat;
		seatCategory: SeatCategory;
		selectedTicketType?: number; // Store the selected ticket type ID
	}

	let { data, form } = $props();

	let showing: Showing = data.showing!;
	let hall: HallType = data.hall!;
	let seatPlan:(SeatResponse | null)[][] = data?.seatPlan || [];
	let ticketTypes: TicketType[] = data.ticketTypes!;
	let selectedSeats: SeatResponse[] = $state([]);

	function toggleSeatSelection(rowIndex: number, colIndex: number): void {
		const seatResponse = seatPlan[rowIndex][colIndex];
		if (seatResponse && !seatResponse.seat.booked) {
			if (isSelected(seatResponse.seat)) {
				selectedSeats = selectedSeats.filter((s) => s.seat.id !== seatResponse.seat.id);
			} else {
				selectedSeats = [...selectedSeats, { ...seatResponse, selectedTicketType: ticketTypes[0]?.id }];
			}
		}
	}

	const isSelected = (seat: Seat): boolean => selectedSeats.some((s) => s.seat.id === seat.id);
	
	function updateTicketType(seatId: number, ticketTypeId: number) {
		selectedSeats = selectedSeats.map(seat => 
			seat.seat.id === seatId 
				? { ...seat, selectedTicketType: ticketTypeId }
				: seat
		);
	}

	function getTicketPrice(seatResponse: SeatResponse): number {
		const ticketType = ticketTypes.find(t => t.id === seatResponse.selectedTicketType);
		return Number(ticketType!.factor) *  Number(seatResponse.seatCategory.price)
	}
	
	function calculateTotal(): number {
		return selectedSeats.reduce((total, seat) => total + getTicketPrice(seat), 0);
	}
</script>

<div class="seat-selection-container">
	<h1>Seat Selection for {showing?.date}</h1>
	<h2>Hall: {hall?.name}</h2>

	{#if form?.success}
		<div class="success-message">
			Seats successfully booked!
		</div>
	{/if}

	{#if form?.error}
		<div class="error-message">
			{form.error}
		</div>
	{/if}

	<div class="content-wrapper">
		<div class="seat-plan">
			{#each seatPlan as row, rowIndex}
				<div class="row">
					{#each row as seat, colIndex}
						{#if seat}
							<div
								class="seat"
								class:selected={isSelected(seat.seat)}
								class:booked={seat.seat.booked}
								onclick={() => toggleSeatSelection(rowIndex, colIndex)}
							>
								{seat.seatCategory.emoji}
							</div>
						{:else}
							<div class="seat placeholder"></div>
						{/if}
					{/each}
				</div>
			{/each}
		</div>

		<div class="summary">
			<h2>Selected Seats</h2>
			{#if selectedSeats.length > 0}
				<form method="POST" action="?/bookSeats">
					<input type="hidden" name="showingId" value={showing?.id} />
					{#each selectedSeats as seatResponse}
						<input type="hidden" name="seatIds" value={seatResponse.seat.id} />
						<input type="hidden" name="ticketTypes" value={seatResponse.selectedTicketType} />
						<input type="hidden" name="price" value={getTicketPrice(seatResponse)} />
						<div class="seat-info">
							<div class="seat-details">
								<span class="seat-number">Seat {seatResponse.seat.row}{seatResponse.seat.seatNumber}</span>
								<span class="seat-type">{seatResponse.seatCategory.name}</span>
								<select
									class="ticket-type-select"
									value={seatResponse.selectedTicketType}
									onchange={(e) => updateTicketType(seatResponse.seat.id, Number(e.currentTarget.value))}
								>
									{#each ticketTypes as ticketType}
										<option value={ticketType.id}>
											{ticketType.name} - ${Number(seatResponse.seatCategory.price) * Number(ticketType.factor)}  
										</option>
									{/each}
								</select>
							</div>
							<div class="seat-price">${getTicketPrice(seatResponse)}</div>
						</div>
					{/each}
					<div class="total-price">
						<span>Total:</span>
						<span class="price">${calculateTotal()}</span>
					</div>
					<Button type="submit">Book Selected Seats</Button>
				</form>
			{:else}
				<p>No seats selected.</p>
			{/if}
		</div>
	</div>


	    <!-- Screen Indicator -->
		<div class="relative mb-12">
			<div class="w-3/4 mx-auto h-2 bg-gray-300 rounded-lg transform -skew-y-1"></div>
			<p class="text-center text-gray-500 mt-2">Screen</p>
		</div>

		<!-- Seat Legend -->
		<div class="flex justify-center gap-4 mb-6">
			<div class="flex items-center gap-2">
				<div class="w-6 h-6 bg-yellow-500 rounded"></div>
				<span>Standard</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-6 h-6 bg-blue-500 rounded"></div>
				<span>Premium</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-6 h-6 bg-purple-500 rounded"></div>
				<span>VIP</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-6 h-6 bg-gray-500 rounded"></div>
				<span>Booked</span>
			</div>
		</div>
</div>

<style>
	.seat-selection-container {
		text-align: center;
		padding: 20px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.content-wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 20px;
		align-items: start;
		margin: 20px 0;
	}

	@media (max-width: 768px) {
		.content-wrapper {
			grid-template-columns: 1fr;
		}
	}

	.success-message {
		background-color: #4CAF50;
		color: white;
		padding: 10px;
		border-radius: 4px;
		margin: 10px 0;
	}

	.error-message {
		background-color: #f44336;
		color: white;
		padding: 10px;
		border-radius: 4px;
		margin: 10px 0;
	}

	.seat-plan {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}

	.row {
		display: flex;
		gap: 10px;
	}

	.seat {
		width: 50px;
		height: 50px;
		border: 2px solid #888;
		background-color: #f0f0f0;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		transition: background-color 0.3s, border-color 0.3s;
	}

	.seat:hover {
		background-color: #d0d0d0;
	}

	.seat.booked {
		background-color: #ff5555;
		cursor: not-allowed;
	}

	.seat.selected {
		background-color: #55ff55;
	}

	.seat.placeholder {
		background-color: transparent;
		border: none;
		cursor: default;
	}

	.summary {
		background-color: #f9f9f9;
		border: 1px solid #ddd;
		padding: 15px;
		border-radius: 8px;
		box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
		height: fit-content;
	}

	.selected-seats-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 12px 0;
	}

	.seat-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px;
		background-color: white;
		border-radius: 4px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.seat-details {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		width: 100%;
	}

	.seat-number {
		font-weight: bold;
		font-size: 0.9em;
	}

	.seat-type {
		font-size: 0.8em;
		color: #666;
	}

	.ticket-type-select {
		width: 100%;
		padding: 4px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 0.9em;
	}

	.seat-price {
		font-weight: bold;
		color: #2c5282;
		font-size: 0.9em;
		margin-left: 8px;
	}

	.total-price {
		display: flex;
		justify-content: space-between;
		padding: 12px 8px;
		margin-top: 8px;
		border-top: 2px solid #ddd;
		font-weight: bold;
		font-size: 1em;
	}

	.price {
		color: #2c5282;
	}

	h2 {
		font-size: 1.2em;
		margin: 0 0 10px 0;
	}
</style>