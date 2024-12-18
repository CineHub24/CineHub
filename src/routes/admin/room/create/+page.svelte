<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { writable } from 'svelte/store';
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';

	interface Sitz {
		sitznummer: number;
		reihe: number;
		spalte: number;
		buchbar: boolean;
	}

	interface Kinosaal {
		hallNumber: string;
		sitze: Sitz[];
	}

	export let sitze = writable<Sitz[]>([
		{
			sitznummer: 0,
			reihe: 0,
			spalte: 1,
			buchbar: true
		}
	]);

	export let kinosaal = writable<Kinosaal>({
		hallNumber: '',
		sitze: []
	});

	let isSaving = false;
	let saveError: string | null = null;

	let nextSitznummer = 0;

	function addRow() {
		const currentMaxRow = Math.max(...$sitze.map((s) => s.reihe), -1);
		const columnCount = Math.max(...$sitze.map((s) => s.spalte), 0) + 1;

		const newRowSeats: Sitz[] = Array.from({ length: columnCount }, (_, spalte) => ({
			sitznummer: nextSitznummer++,
			reihe: currentMaxRow + 1,
			spalte,
			buchbar: true
		}));

		sitze.update((current) => [...current, ...newRowSeats]);
	}

	function addColumn() {
		const currentMaxCol = Math.max(...$sitze.map((s) => s.spalte), -1);
		const rowCount = Math.max(...$sitze.map((s) => s.reihe), 0) + 1;

		const newColumnSeats: Sitz[] = Array.from({ length: rowCount }, (_, reihe) => ({
			sitznummer: nextSitznummer++,
			reihe,
			spalte: currentMaxCol + 1,
			buchbar: true
		}));

		sitze.update((current) => [...current, ...newColumnSeats]);
	}

	function addSeat(reihe: number, spalte: number) {
		console.log('sitze');
		sitze.update((current) => {
			// Check if seat already exists
			const existingSeat = current.find((s) => s.reihe === reihe && s.spalte === spalte);
			if (existingSeat) return current;

			return [
				...current,
				{
					sitznummer: nextSitznummer++,
					reihe,
					spalte,
					buchbar: true
				}
			];
		});
		console.log(sitze);
	}

	function removeSeat(sitznummer: number) {
		sitze.update((current) => current.filter((s) => s.sitznummer !== sitznummer));
	}

	$: maxRow = Math.max(...$sitze.map((s) => s.reihe), -1);
	$: maxCol = Math.max(...$sitze.map((s) => s.spalte), -1);

	const handleSubmit: SubmitFunction = ({ formElement, formData, action, cancel }) => {
		// Optional client-side enhancement
		return async ({ result, update }) => {
			if (result.type === 'success') {
				// Handle successful submission
			}
		};
	};

	function switchToLanguage(newLanguage: AvailableLanguageTag) {
		const canonicalPath = i18n.route($page.url.pathname);
		const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
		goto(localisedPath);
	}

	function onFilmClick() {
		goto('/admin/films');
	}

	function onAddFilmClick() {
		goto('/admin/add_films');
	}
</script>

<div class="seat-grid-editor-wrapper">
	<div class="seat-grid-editor">
		<form method="POST" action="?/saveKinosaal" use:enhance={handleSubmit}>
			<div class="kinosaal-name">
				<label for="kinosaal-number">Kinosaal Name:</label>
				<input
					type="text"
					name="hall-number"
					id="hall-number"
					bind:value={$kinosaal.hallNumber}
					placeholder="Enter Kinosaal nummer"
				/>
			</div>

			<div class="controls">
				<button on:click={addRow}>Add Row</button>
				<button on:click={addColumn}>Add Column</button>

				<input type="hidden" name="sitze" value={JSON.stringify($sitze)} />

				<button type="submit" on:click={() => console.log($sitze)}>Save Kinosaal</button>
			</div>

			{#if saveError}
				<div class="error-message">
					{saveError}
				</div>
			{/if}
		</form>
	</div>
</div>

<div class="seat-grid-container">
	<div class="grid">
		{#each Array(maxRow + 1) as _, row}
			<div class="seat-row">
				{#each Array(maxCol + 1) as _, col}
					{@const seat = $sitze.find((s) => s.reihe === row && s.spalte === col)}
					{#if seat}
						<div class="seat-container">
							<button class="seat" class:available={seat.buchbar}>
								{seat.sitznummer}
							</button>
							<button class="remove-seat" on:click={() => removeSeat(seat.sitznummer)}> ✕ </button>
						</div>
					{:else}
						<button class="add-seat" on:click={() => addSeat(row, col)}> + </button>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.seat-grid-editor-wrapper {
		padding-top: 20px; /* Padding outside the top card */
	}

	.seat-grid-editor {
		display: flex;
		flex-direction: column;
		gap: 20px;
		align-items: center;
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 8px;
		background-color: #f9f9f9;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		max-width: 900px;
		margin: 0 auto;
	}

	.kinosaal-name {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
	}

	.kinosaal-name label {
		font-weight: bold;
		font-size: 1rem;
	}

	.kinosaal-name input {
		padding: 10px;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		width: 100%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.seat-grid-container {
		max-width: 900px;
		overflow-x: auto;
		padding: 20px;
		margin-top: 20px;
		border: 1px solid #ccc;
		border-radius: 8px;
		background-color: #f9f9f9;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		margin-left: auto;
		margin-right: auto;
		text-align: center;
	}

	.grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: center;
		padding-right: 50px; /* Increased padding for horizontal scrolling */
	}

	.seat-row {
		display: flex;
		gap: 10px;
	}

	.seat-container {
		position: relative;
	}

	.seat {
		width: 50px;
		height: 50px;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		font-size: 0.9rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.remove-seat {
		position: absolute;
		top: -5px;
		right: -5px;
		background-color: red;
		color: white;
		border: none;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.add-seat {
		width: 50px;
		height: 50px;
		background-color: #2196f3;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		font-size: 1.2rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.controls {
		display: flex;
		gap: 15px;
		margin-top: 20px;
	}

	.controls button {
		padding: 10px 20px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.controls button:hover {
		background-color: #0056b3;
	}

	.error-message {
		color: red;
		font-weight: bold;
		text-align: center;
	}

	@media (max-width: 768px) {
		.seat-grid-editor {
			padding: 10px;
		}

		.kinosaal-name input,
		.controls button {
			font-size: 0.9rem;
		}

		.seat {
			width: 40px;
			height: 40px;
			font-size: 0.8rem;
		}

		.add-seat {
			width: 40px;
			height: 40px;
			font-size: 1rem;
		}
	}
</style>
