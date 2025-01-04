<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Button from '$lib/components/button.svelte';

	// Interfaces for type safety
	interface Seat {
		id: number;
		seatNumber: string;
		row: string;
		cinemaHall: number;
		categoryId: number;
		booked?: boolean;
	}

  let {data} = $props();


	let showing: any;
	let hall: any;
	let seatPlan: (Seat | null)[][] = [];
	let selectedSeats: Seat[] = $state([]);
	let seatPlanData = [];


	// Fetch the data from the load function
	
  if (data) {
    showing = data.showing;
    hall = data.hall;
    seatPlan = data.seatPlan!;
  }

  function toggleSeatSelection(rowIndex: number, colIndex: number) {
    const seat = seatPlan[rowIndex][colIndex];
    if (seat && !seat.booked) {
        if (isSelected(seat)) {
            selectedSeats = selectedSeats.filter((s) => s.id !== seat.id);
        } else {
            selectedSeats = [...selectedSeats, seat];
        }
    }
    console.log('Selected Seats:', selectedSeats);
}

	// Check if a seat is selected
	function isSelected(seat: Seat) {
		return selectedSeats.some((s) => s.id === seat.id);
	}

	// Submit selected seats
	async function submitSeats() {
		try {
			const response = await fetch('/submit-seats', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					showingId: showing.id,
					selectedSeatIds: selectedSeats.map((seat) => seat.id)
				})
			});

			if (!response.ok) {
				throw new Error('Failed to submit selected seats.');
			}

			alert('Seats successfully booked!');
			selectedSeats = [];
		} catch (error) {
			console.error(error);
			alert('An error occurred while booking seats.');
		}
	}
</script>

<div class="seat-selection-container">
	<h1>Seat Selection for {showing.title}</h1>
	<h2>Hall: {hall.name}</h2>

	<div class="seat-plan">
		{#each seatPlan as row, rowIndex}
			<div class="row">
				{#each row as seat, colIndex}
					{#if seat}
						<div
							class="seat"
							class:selected={isSelected(seat)}
							class:booked={seat.booked}
							onclick={() => toggleSeatSelection(rowIndex, colIndex)}
						>
							{seat.seatNumber}
						</div>
					{:else}
						<div class="seat placeholder"></div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>

	<div class="actions">
		<Button on:click={submitSeats}>Book Selected Seats</Button>
	</div>
</div>

<style>
	.seat-selection-container {
		text-align: center;
		padding: 20px;
	}

	.seat-plan {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		margin: 20px 0;
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

	.actions {
		margin-top: 20px;
	}
</style>
