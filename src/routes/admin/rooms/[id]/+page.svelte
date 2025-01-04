<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import { languageAwareGoto } from '$lib/utils/languageAware';

	// Define interfaces for type safety
	interface Seat {
		id: number | null;
		seatNumber: string;
		row: string;
		cinemaHall: number;
		categoryId: number;
	}

	interface SeatCategory {
		id: number;
		name: string;
		desctiption: string;
		emoji: string;
	}

	// Initialize seatPlan with an empty array
	let seatPlan: (Seat | null)[][] = $state([]);
	let seatTypes: SeatCategory[] = [];
	let name: string;
	let hallId: number;

	let data = $props();

	console.log(data);

	let isEditMode = data?.data?.cinemaHall && data?.data?.seatPlan;

	if (isEditMode) {
		name = data.data.cinemaHall.name;
		hallId = data.data.cinemaHall.id;
		seatPlan = data.data.seatPlan;
	}

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
									: ({
											categoryId: 0,
											seatNumber: `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`,
											row: `${String.fromCharCode(65 + rowIndex)}`,
											cinemaHall: hallId
										} as Seat);
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
		const currentIndex = seatTypes.findIndex((category) => category.id === seat.categoryId);
		const nextIndex = (currentIndex + 1) % seatTypes.length;
		const updatedSeat = {
			...seat,
			type: seatTypes[nextIndex].name,
			categoryId: seatTypes[nextIndex].id
		};

		// Logging the current and new seat type
		console.log(`Changing seat type for Seat ID: ${seat.id}`);
		console.log(`Current Type: ${seat.categoryId}`);
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
					categoryId: 0,
					seatNumber: `${String.fromCharCode(65 + newRowIndex)}${i + 1}`,
					row: `${String.fromCharCode(65 + newRowIndex)}`,
					cinemaHall: hallId
				}) as Seat
		);
		seatPlan = [...seatPlan, newRow];
	}

	function addColumn() {
		seatPlan = seatPlan.map((row, rowIndex) => [
			...row,
			{
				categoryId: 0,
				seatNumber: `${String.fromCharCode(65 + rowIndex)}${row.length + 1}`,
				cinemaHall: hallId,
				row: `${String.fromCharCode(65 + rowIndex)}`
			} as Seat
		]);
	}

	function removeRow(rowIndex: number) {
		seatPlan = seatPlan.filter((_, rIdx) => rIdx !== rowIndex);
	}

	function removeColumn(colIndex: number) {
		seatPlan = seatPlan.map((row) => row.filter((_, cIdx) => cIdx !== colIndex));
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
								categoryId: 0,
								seatNumber: `${String.fromCharCode(65 + rowIndex)}${cIdx + 1}`,
								row: `${String.fromCharCode(65 + rowIndex)}`
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
					? ({ categoryId: 0, seatNumber: `${String.fromCharCode(65 + rIdx)}${cIdx + 1}` } as Seat)
					: seat
			)
		);
		seatPlan = updatedPlan;
	}

	function prepareSeatData() {
		const seats: Seat[] = [];
		seatPlan.forEach((row, rowIndex) => {
			row.forEach((seat) => {
				if (seat) {
					let category;
					if (data?.data?.categories) {
						category = seatTypes.find((cat) => cat.id === seat.categoryId);
					}
					seats.push({
						seatNumber: seat.seatNumber,
						row: seat.seatNumber?.charAt(0),
						cinemaHall: hallId,
						categoryId: category!.id
					} as Seat);
				}
			});
		});

		return JSON.stringify(seats);
	}

	function beforeUnload(event: BeforeUnloadEvent) {
		// Cancel the event as stated by the standard.
		event.preventDefault();
		// Chrome requires returnValue to be set.
		event.returnValue = '';
		// more compatibility
		return '...';
	}

</script>

<svelte:window on:beforeunload={beforeUnload}/>

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
			<span class="label"
				>No Categories Available you should add one: <a href="/admin/add_seat_category"
					>Create New Seat Category</a
				>
			</span>
		</div>
	{/if}
	<button
		class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
		onclick={() => {
			languageAwareGoto('/admin/seatCategory');
		}}
	>
		+ Sitzkategorie
	</button>
</div>

<form method="POST" action="?/saveSeats">
	<div>
		<label for="name">Hall Name:</label>
		<input type="text" id="name" name="name" bind:value={name} required />
		<label for="name">Which cinema</label>
		<select name="cinemaId" id="cinemaId">
			{#each data.data.cinemas as cinema}
				<option value={cinema.id}>{cinema.name}</option>
			{/each}
		</select>
	</div>

	<input type="hidden" name="seatPlanData" value={prepareSeatData()} />
	<input type="hidden" name="hallId" value={hallId} />

	<button type="submit" class="float">⬇</button>
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
				class="toggle"
				checked={mode === 'changeType'}
				onclick={() => toggleMode(mode === 'removeRestore' ? 'changeType' : 'removeRestore')}
			/>
			<span class="slider"></span>
		</label>
		<span class="card-side"
			>{mode === 'removeRestore' ? 'Remove/Restore Mode' : 'Change Type Mode'}</span>
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
					><p style="font-size: 35px;">♻️</p></button
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

	.float {
		position: fixed;
		width: 60px;
		height: 60px;
		bottom: 40px;
		right: 40px;
		background-color: #0c9;
		color: #fff;
		border-radius: 50px;
		text-align: center;
		box-shadow: 2px 2px 3px #999;
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
		width: 50px; /* Match the width of the seat */
		height: 50px; /* Match the height of the seat */
		font-size: 14px; /* Adjust font size for readability */
		background-color: #ff5555;
		color: white;
		border: none;
		cursor: pointer;
		text-align: center;
		border-radius: 5px;
		transition: background-color 0.3s;
		display: flex;
		justify-content: center;
		align-items: center; /* Center the text vertically */
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
		width: 50px;
		height: 50px;
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
		transition:
			background-color 0.3s,
			border-color 0.3s;
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
		width: 50px; /* Increase the width to align with row content */
		height: 50px; /* Match the height of the seat */
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
		align-items: center; /* Center the text vertically */
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
	/* From Uiverse.io by andrew-demchenk0 */
	.switch {
		--input-focus: #2d8cf0;
		--bg-color: #fff;
		--bg-color-alt: #666;
		--main-color: #323232;
		--input-out-of-focus: #ccc;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 30px;
		width: 70px;
		height: 36px;
		transform: translateX(calc(50% - 10px));
	}

	.toggle {
		opacity: 0;
	}

	.slider {
		box-sizing: border-box;
		border-radius: 100px;
		border: 2px solid var(--main-color);
		box-shadow: 4px 4px var(--main-color);
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--input-out-of-focus);
		transition: 0.3s;
	}

	.slider:before {
		content: 'off';
		box-sizing: border-box;
		height: 30px;
		width: 30px;
		position: absolute;
		left: 2px;
		bottom: 1px;
		border: 2px solid var(--main-color);
		border-radius: 100px;
		background-color: var(--bg-color);
		color: var(--main-color);
		font-size: 14px;
		font-weight: 600;
		text-align: center;
		line-height: 25px;
		transition: 0.3s;
	}

	.toggle:checked + .slider {
		background-color: var(--input-focus);
		transform: translateX(-32px);
	}

	.toggle:checked + .slider:before {
		content: 'on';
		transform: translateX(32px);
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
