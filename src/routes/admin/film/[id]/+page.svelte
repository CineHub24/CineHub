<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import ShowsByDate from '$lib/components/ShowsByDate.svelte';
	import type { PageData } from './$types';
	import type { Film, freeSlots, Showing } from './+page.server.js';

	let { data }: { data: PageData } = $props();
	let { film, shows, halls, priceSets } = data;

	let showAddShowForm = $state(false);
	let activeTab: 'details' | 'shows' = $state('details');

	function toggleShowForm() {
		showAddShowForm = !showAddShowForm;
	}

	let slots: freeSlots[] = $state([]);

	function selectSlot(slot: freeSlots) {
		// Additional logic for slot selection can be added here
	}
</script>

<div class="film-edit-page" style="background-image: url({film.backdrop});">
	<div class="film-edit-container">
		{#if film}
			<div class="header">
				<h2>Film bearbeiten: {film.title}</h2>
				<form method="post" action="?/delete">
					<div class="form-actions" style="margin: 0;">
						<button style="background-color: red;">Löschen</button>
					</div>
				</form>
			</div>

			<!-- Tabs -->
			<div class="tabs">
				<button
					class={`tab ${activeTab === 'details' ? 'active' : ''}`}
					onclick={() => (activeTab = 'details')}
				>
					Film Details
				</button>
				<button
					class={`tab ${activeTab === 'shows' ? 'active' : ''}`}
					onclick={() => (activeTab = 'shows')}
				>
					Vorstellungen
				</button>
			</div>

			{#if activeTab === 'details'}
				<form method="post" action="?/update" name="update">
					<div class="form-columns">
						<div class="form-column">
							<div class="form-group">
								<label for="title">Titel:</label>
								<input name="title" bind:value={film.title} type="text" required />
							</div>

							<div class="form-group">
								<label for="genre">Genre:</label>
								<input name="genre" bind:value={film.genres} type="text" required />
							</div>

							<div class="form-group">
								<label for="runtime">Laufzeit:</label>
								<input readonly name="runtime" bind:value={film.runtime} type="text" required />
							</div>
						</div>
						<div class="form-column">
							<div class="form-group">
								<label for="director">Regisseur:</label>
								<input name="director" bind:value={film.director} type="text" required />
							</div>

							<div class="form-group">
								<label for="description">Beschreibung:</label>
								<textarea name="description" bind:value={film.description} required></textarea>
							</div>
						</div>
					</div>

					<div class="form-actions">
						<button type="submit">Speichern</button>
					</div>
				</form>
			{:else}
				<div class="shows-section">
					<div class="shows-header">
						<h3>Vorstellungen</h3>
						<button
							onclick={toggleShowForm}
							class="add-show-button"
							aria-label="Vorstellung hinzufügen"
						>
							+
						</button>
					</div>

					<ShowsByDate {shows} />
				</div>
			{/if}
		{:else}
			<p class="not-found">Film nicht gefunden</p>
		{/if}
	</div>
</div>

{#if showAddShowForm}
	<div class="popup-overlay">
		<div class="popup-content">
			<button class="close-popup" onclick={toggleShowForm}>&times;</button>
			<h3>Neue Vorstellung hinzufügen</h3>

			{#if slots && slots.length > 0}
				<div class="free-slots">
					<h4>Freie Slots</h4>
					<div class="slots-list">
						{#each slots as slot}
							<form action="?/save" method="POST" onsubmit={() => selectSlot(slot)}>
								<input type="hidden" name="filmId" value={film.id} />
								<input type="hidden" name="slotStart" value={slot.start} />
								<input type="hidden" name="slotEnd" value={slot.end} />
								<input type="hidden" name="hall" value={slot.hallid} />
								<input type="hidden" name="date" value={slot.date} />
								<input type="hidden" name="priceSet" value={slot.priceSetId} />
								<button type="submit">
									{slot.start} - {slot.end}
								</button>
							</form>
						{/each}
					</div>
				</div>
			{:else}
				<form
					method="post"
					action="?/create"
					name="create"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success' && result.data?.slots) {
								slots = result.data.slots as freeSlots[];
							}
							await update();
						};
					}}
					class="add-show-form"
				>
					<div class="form-group">
						<label for="hall">Saal:</label>
						<select name="hall">
							{#each halls as hall}
								<option value={hall.id}>Saal {hall.hallNumber}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label for="priceSet">Preisset:</label>
						<select name="priceSet">
							{#each priceSets as set}
								<option value={set.id}>{set.name}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label for="date">Datum:</label>
						<input name="date" type="date" required />
					</div>
					<div class="form-actions">
						<button type="submit">Freie Slots laden</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}

<style>
	.film-edit-page {
		width: 100%;
		/* min-height: 100vh; */
		/* background-color: #f4f4f4; */
		padding: 20px;
		box-sizing: border-box;
	}

	.film-edit-container {
		width: 100%;
		max-width: 1200px;
		min-height: 75vh;
		margin: 0 auto;
		background-color: white;
		padding: 40px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
	}

	.tabs {
		display: flex;
		margin-bottom: 30px;
		border-bottom: 1px solid #ddd;
	}

	.tab {
		padding: 12px 20px;
		background: none;
		border: none;
		border-bottom: 3px solid transparent;
		cursor: pointer;
		color: #666;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.tab.active {
		border-bottom-color: #007bff;
		color: #007bff;
	}

	.form-columns {
		display: flex;
		gap: 30px;
	}

	.form-column {
		flex: 1;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;
		padding-bottom: 15px;
		border-bottom: 1px solid #eee;
	}

	.header h2 {
		margin: 0;
		font-size: 1.8em;
		color: #333;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
		color: #333;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1em;
	}

	.form-group textarea {
		height: 150px;
		resize: vertical;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 30px;
	}

	.form-actions button {
		padding: 12px 25px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: 0.3s ease;
	}

	.form-actions buttonhover {
		background-color: #0056b3;
	}

	.shows-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;
	}

	.shows-header h3 {
		margin: 0;
		font-size: 1.5em;
		color: #333;
	}

	.add-show-button {
		color: black;
		width: 40px;
		height: 40px;
		border-radius: 10px;
		font-size: 24px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.add-show-buttonbefore {
		content: '+';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.add-show-buttonhover {
		transform: scale(1.05);
	}

	.add-show-buttonactive {
		transform: scale(0.95);
	}

	.add-show-form {
		background-color: #f8f9fa;
		padding: 30px;
		border-radius: 8px;
		margin-bottom: 30px;
	}

	.free-slots {
		background-color: #f8f9fa;
		padding: 30px;
		border-radius: 8px;
		margin-bottom: 30px;
		margin-top: 10px;
	}

	.free-slots h4 {
		margin-bottom: 10px;
	}
	.slots-list {
		max-height: 250px;
		overflow-y: auto;
	}

	.slots-list form {
		margin-bottom: 10px;
	}

	.slots-list button {
		width: 100%;
		padding: 12px;
		background-color: #fff;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		transition: 0.3s ease;
	}

	.slots-list buttonhover {
		background-color: #f1f1f1;
	}

	.not-found {
		text-align: center;
		color: #666;
		font-size: 1.2em;
		padding: 50px;
	}

	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.popup-content {
		background-color: white;
		padding: 30px;
		padding-top: 20px;
		border-radius: 8px;
		width: 90%;
		max-width: 500px;
		max-height: 80vh;
		overflow-y: auto;
		position: relative;
	}

	.popup-content h3 {
		margin: 0;
		font-weight: 600;
		color: #333;
	}

	.close-popup {
		position: absolute;
		top: 10px;
		right: 20px;
		font-size: 24px;
		background: none;
		border: none;
		cursor: pointer;
	}

	.add-show-form {
		margin-top: 20px;
	}
</style>
