<script lang="ts">
	// Define interfaces for type safety
	interface Seat {
		id: string;
		type: string;
		categoryId: number;
		seatNumber: string | null;
	}

	interface SeatCategory {
		id: number;
		name: string;
		emoji: string;
	}

	// Initialize seatPlan with an empty array
	let seatPlan: (Seat | null)[][] = $state([]);

	let data = $props();

	console.log(data);

	let name: string;

	// Check if we are in edit mode (pre-existing hall data)
	let isEditMode = data?.data?.cinemaHall && data?.data?.seatPlan;

	if (isEditMode) {
		name = data.data.cinemaHall.name;
		seatPlan = data.data.seatPlan;
	}

	// Properly typed seat types array
	let seatTypes: SeatCategory[] = [];


	// Safely populate seat types
	if (data?.data?.categories && data.data.categories.length > 0) {
		seatTypes = data.data.categories as SeatCategory[];
	} else {
		console.warn('Error: No seat categories provided! - Snackbar!!!');
	}

	let mode: 'removeRestore' | 'changeType' = $state('removeRestore');

	function toggleMode(newMode: 'removeRestore' | 'changeType') {
		mode = newMode;
	}

	function toggleSeat(rowIndex: number, colIndex: number) {
		seatPlan = seatPlan.map((row, rIdx) =>
			rIdx === rowIndex
				? row.map((seat, cIdx) => {
						if (cIdx === colIndex) {
							if (mode === 'removeRestore') {
								return seat
									? null
									: { id: `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`, type: 'standart', categoryId: 0, seatNumber: `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}` };
							} else if (mode === 'changeType' && seat) {
								return changeSeatType(seat);
							}
						}
						return seat;
					})
				: row
		);
	}


	function changeSeatType(seat: Seat): Seat {
		const currentIndex = seatTypes.findIndex(category => category.id === seat.categoryId);
		const nextIndex = (currentIndex + 1) % seatTypes.length;
		const updatedSeat = { ...seat, type: seatTypes[nextIndex].name, categoryId: seatTypes[nextIndex].id };

		// Logging the current and new seat type
		console.log(`Changing seat type for Seat ID: ${seat.id}`);
		console.log(`Current Type: ${seat.type}`);
		console.log(`New Type: ${seatTypes[nextIndex].name}`);
		console.log(`Updated Seat:`, updatedSeat);

		return updatedSeat;
	}

	function getSeatEmoji(id: number): string {
		const seatType = seatTypes.find((category) => category.id === id);
		return seatType?.emoji || '❓';
	}

	function toggleRow(rowIndex: number) {
		const emptySeats = seatPlan[rowIndex]?.filter((seat) => seat === null).length || 0;
		const totalSeats = seatPlan[rowIndex]?.length || 0;

		if (emptySeats >= totalSeats / 2) {
			// If half or more seats are empty, restore the row
			restoreSeatRow(rowIndex);
		} else {
			// Otherwise, remove the row
			removeSeatRow(rowIndex);
		}
	}

	function toggleColumn(colIndex: number) {
		const emptySeats = seatPlan.filter((row) => row[colIndex] === null).length;
		const totalSeats = seatPlan.length;

		if (emptySeats >= totalSeats / 2) {
			// If half or more seats are empty, restore the column
			restoreSeatColumn(colIndex);
		} else {
			// Otherwise, remove the column
			removeSeatColumn(colIndex);
		}
	}

	function addRow() {
		const newRowIndex = seatPlan.length;
		const newRow = Array.from(
			{ length: seatPlan.length > 0 ? seatPlan[0].length : 4 }, // Use 4 as the default number of seats per row
			(_, i) =>
				({
					id: `${String.fromCharCode(65 + newRowIndex)}${i + 1}`,
					type: seatTypes.length > 0 ? seatTypes[0].name : '',
					categoryId: 0,
					seatNumber: `${String.fromCharCode(65 + newRowIndex)}${i + 1}`
				}) as Seat
		);
		seatPlan = [...seatPlan, newRow];
	}

	function addColumn() {
		seatPlan = seatPlan.map((row, rowIndex) => [
			...row,
			{ id: `${String.fromCharCode(65 + rowIndex)}${row.length + 1}`, type: seatTypes.length > 0 ? seatTypes[0].name : '',  categoryId: 0, seatNumber: `${String.fromCharCode(65 + rowIndex)}${row.length + 1}` }
		]);
	}

	function removeRow(rowIndex: number) {
		seatPlan = seatPlan.filter((_, rIdx) => rIdx !== rowIndex);
	}

	function removeColumn(colIndex: number) {
		seatPlan = seatPlan.map((row) => row.filter((_, cIdx) => cIdx !== colIndex));
	}

	function removeSeat(rowIndex: number, colIndex: number) {
		const updatedPlan = seatPlan.map((row, rIdx) =>
			rIdx === rowIndex ? row.map((seat, cIdx) => (cIdx === colIndex ? null : seat)) : row
		);
		seatPlan = updatedPlan;
	}

	function restoreSeat(rowIndex: number, colIndex: number) {
		const originalId = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
		const updatedPlan = seatPlan.map((row, rIdx) =>
			rIdx === rowIndex
				? row.map((seat, cIdx) =>
						cIdx === colIndex ? ({ id: originalId, type: 'single' } as Seat) : seat
					)
				: row
		);
		seatPlan = updatedPlan;
	}

	function removeSeatRow(rowIndex: number) {
		const updatedPlan = seatPlan.map((row, rIdx) =>
			rIdx === rowIndex ? row.map(() => null) : row
		);
		seatPlan = updatedPlan;
	}

	function removeSeatColumn(colIndex: number) {
		const updatedPlan = seatPlan.map((row) =>
			row.map((seat, cIdx) => (cIdx === colIndex ? null : seat))
		);
		seatPlan = updatedPlan;
	}

	function restoreSeatRow(rowIndex: number) {
		const updatedPlan = seatPlan.map((row, rIdx) =>
			rIdx === rowIndex
				? row.map(
						(_, cIdx) =>
							({
								id: `${String.fromCharCode(65 + rowIndex)}${cIdx + 1}`,
								type: 'single',
								categoryId: 0,
								seatNumber: `${String.fromCharCode(65 + rowIndex)}${cIdx + 1}`
							}) as Seat
					)
				: row
		);
		seatPlan = updatedPlan;
	}

	function restoreSeatColumn(colIndex: number) {
		const updatedPlan = seatPlan.map((row, rIdx) =>
			row.map((seat, cIdx) =>
				cIdx === colIndex
					? ({ id: `${String.fromCharCode(65 + rIdx)}${colIndex + 1}`, type: 'single', categoryId: 0, 	seatNumber: `${String.fromCharCode(65 + rIdx)}${cIdx + 1}`	} as Seat)
					: seat
			)
		);
		seatPlan = updatedPlan;
	}

	function prepareSeatData() {
		const seats: { seatNumber: string; row: string; type: string; categoryId: number }[] = [];
		seatPlan.forEach((row, rowIndex) => {
			row.forEach((seat) => {
				if (seat) {
					let category;
					if (data?.data?.categories) {
						category = data.data.categories.find((cat) => cat.id === seat.categoryId);
					}
					seats.push({
						seatNumber: seat.seatNumber || '',
						row: seat.seatNumber?.charAt(0) || '',
						type: seat.type,
						categoryId: category.id, // Fallback to 1 if not found
					});
				}
			});
		});

		return JSON.stringify(seats);
	}
</script>

<div class="legend">
	{#if data && Array.isArray(data.data.categories) && data.data.categories.length > 0}
		{#each data.data.categories as category}
			<div class="legend-item">
				<span class="emoji">{category.emoji}</span>
				<span class="label">{category.name}</span>
			</div>
		{/each}
	{:else}
		<div class="legend-item">
			<span class="emoji">❓</span>
			<span class="label">No Categories Available you should add one: <a href="/admin/add_seat_category">Create New Seat Category</a>
			</span>
		</div>
	{/if}
</div>

<a href="/admin/add_seat_category">Create New Seat Category</a>

<form method="POST" action="?/saveSeats">
	<div>
		<label for="name">Hall Name:</label>
		<input type="text" id="name" name="name" bind:value={name} required />
		<label for="name">Which cinema</label>
		<select name="cinemaId" id="cinemaId">
			{#each data.data.cinemas as cinema}
				<option value={cinema.id}>{cinema.name}</option>
			{/each}
	</div>

	<input type="hidden" name="seatPlanData" value={prepareSeatData()} />

	<button type="submit" >Save Seat Plan</button>
</form>

{#if data?.form?.error}
	<p class="error">{data.form.message || 'An unexpected error occurred.'}</p>
{:else if data?.form?.success}
	<p class="success">{data.form.success.message}</p>
{/if}

<div class="controls">
    <div class="primary-controls">
        <button onclick={addRow}>Add Row</button>
        <button onclick={addColumn}>Add Column</button>
        <button onclick={() => removeRow(seatPlan.length - 1)}>Remove Last Row</button>
        <button onclick={() => removeColumn(seatPlan[0]?.length - 1)}>Remove Last Column</button>
    </div>
    
    <div class="mode-toggle">
        <label class="switch">
            <input 
                type="checkbox" 
                checked={mode === 'changeType'} 
                onclick={() => toggleMode(mode === 'removeRestore' ? 'changeType' : 'removeRestore')}
            />
            <span class="slider"></span>
        </label>
        <span class="toggle-label">{mode === 'removeRestore' ? 'Remove/Restore Mode' : 'Change Type Mode'}</span>
    </div>
</div>


<div class="container">
	{#if seatPlan[0]}
		<div class="column-controls">
			{#each seatPlan[0] as _, colIndex}
				<button onclick={() => toggleColumn(colIndex)}>
					<p style="font-size: 35px;">♻️</p>
				</button>
			{/each}
		</div>
	{/if}

	<div class="seat-plan">
		{#each seatPlan as row, rowIndex}
			<div class="row">
				{#each row as seat, colIndex}
					{#if seat}
						<div class="seat" onclick={() => toggleSeat(rowIndex, colIndex)}>
							{seat.seatNumber}<br />
							{getSeatEmoji(Number(seat.categoryId))}
						</div>
					{:else}
						<div class="seat placeholder" onclick={() => toggleSeat(rowIndex, colIndex)}></div>
					{/if}
				{/each}
				<button class="row-btn" onclick={() => toggleRow(rowIndex)}
					>Remove/Restore Row {rowIndex + 1}</button
				>
			</div>
		{/each}
	</div>
</div>



<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #f5f5f5;
  padding: 20px;
  position: relative;
  max-width: fit-content;
  border: 1px solid #ddd;
  border-radius: 10px;

}

/* Controls for adding/removing rows and columns */
.controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
}

.controls button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.controls button:hover {
  background-color: #0056b3;
}

.controls button.active {
  background-color: #0056b3;
  color: white;
  font-weight: bold;
}

/* Column controls for toggling columns */
.column-controls {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
  justify-content: flex-start;
  width: fit-content;
  
}

.column-controls button {
  width: 70px;           /* Match the width of the seat */
  height: 70px;          /* Match the height of the seat */
  font-size: 14px;       /* Adjust font size for readability */
  background-color: #ff5555;
  color: white;
  border: none;
  cursor: pointer;
  text-align: center;
  border-radius: 5px;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;   /* Center the text vertically */
  padding: 0;
  margin-right: 5px;
}

.column-controls button:hover {
  background-color: #d94444;
}


/* Seat plan grid layout */
.seat-plan {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Each row of seats */
.row {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Individual seat styling */
.seat {
  width: 70px;
  height: 70px;
  border: 2px solid #888;
  background-color: #f0f0f0;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s, border-color 0.3s;
  line-height: 1.2;
}

.seat:hover {
  background-color: #d0d0d0;
  border-color: #555;
}

/* Placeholder seat for removed seats */
.seat.placeholder {
  background-color: #e0e0e0;
  color: #888;
  border: 2px dashed #ccc;
  cursor: pointer;
}

.seat.placeholder:hover {
  background-color: #d0d0d0;
}

/* Row buttons for removing/restoring rows */
.row-btn {
  width: 150px;          /* Increase the width to align with row content */
  height: 70px;          /* Match the height of the seat */
  background-color: #ff5555;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  border-radius: 5px;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;   /* Center the text vertically */
  padding: 0;
}


.row-btn:hover {
  background-color: #d94444;
}


.legend {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.legend-item .emoji {
  font-size: 24px;
}

.legend-item .label {
  font-weight: bold;
  color: #555;
}

.success {
    color: green;
    font-weight: bold;
  }

  .error {
    color: red;
    font-weight: bold;
  }


/* Unified hover effect for buttons in controls and row/column buttons */
.controls button:hover,
.column-controls button:hover,
.row-btn:hover {
  background-color: #0056b3;
}

/* Responsive Design: Adjust for smaller screens */
@media (max-width: 600px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .controls button {
    width: 100%;
  }

  .row {
    flex-direction: column;
  }

  .seat {
    width: 100%;
  }

  .column-controls {
    flex-direction: column;
    width: 100%;
  }

  .column-controls button {
    width: 100%;
  }
}
</style>

