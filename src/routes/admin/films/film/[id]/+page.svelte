<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import ShowsByDate from '$lib/components/ShowsByDate.svelte';
	import { type PageData } from './$types';
	import type { Film, freeSlots, Showing } from './+page.server.js';

	let { data }: { data: PageData } = $props();
	let { film, shows, halls, priceSets } = data;

	let showAddShowForm = $state(false);
	function toggleShowForm() {
		showAddShowForm = !showAddShowForm;
	}

	let slots: freeSlots[] = $state([]);

	function zurueck() {
		goto('/admin/films');
	}
	function handleSubmit(event: Event) {
        toggleShowForm();
        const form = event.target as HTMLFormElement;
        form.submit();
    }
</script>

{#if film}
	<div class="container">
		<h2>Film bearbeiten</h2>

		<form method="post" action="?/update" name="update">
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
				<input name="runtime" bind:value={film.runtime} type="text" required />
			</div>
			<div class="form-group">
				<label for="director">Regiseur:</label>
				<input name="director" bind:value={film.director} type="text" required />
			</div>
			<div class="form-group">
				<label for="description">Beschreibung:</label>
				<input name="description" bind:value={film.description} type="text" required />
			</div>
			<div class="actions">
				<button type="submit">Speichern</button>
				<button type="button" onclick={zurueck}>Zurück</button>
			</div>
		</form>
	</div>
	<div class="container">
		<div class="actions">
			<button onclick={toggleShowForm}>+</button>
		</div>
	</div>
	{#if showAddShowForm}
		<div>
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
				}}>
			
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
				<div class="actions">
					<button type="submit">Erstellen</button>
				</div>
			</form>
		</div>
	{/if}
	
	{#if slots && slots.length > 0}
	<div class="container">
		<h1>Freie Slots</h1>
	</div>
		<div class="slots-container">
			<ul class="scrollable-list">
				{#each slots as slot}
					<li>
						<form action="?/save" method="POST">
							<input type="hidden" name="filmId" value={film.id} />
							<input type="hidden" name="slotStart" value={slot.start} />
							<input type="hidden" name="slotEnd" value={slot.end} />
							<input type="hidden" name="hall" value={slot.hallid} />
							<input type="hidden" name="date" value={slot.date} />
							<input type="hidden" name="priceSet" value={slot.priceSetId} />
							<button>{slot.start} - {slot.end}</button>
						</form>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	<div class="container">
		<h1>Vorstellungen</h1>
	</div>
	<ShowsByDate {shows} />
{:else}
	<p>Film nicht gefunden</p>
{/if}

<style>
	.container {
		max-width: 400px;
		margin: 0 auto;
		padding: 20px;
	}
	.form-group {
		margin-bottom: 15px;
		display: flex;
		flex-direction: column;
	}
	label {
		margin-bottom: 5px;
	}
	input {
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
	}
	.actions {
		display: flex;
		gap: 10px;
		margin-top: 20px;
	}
	button {
		padding: 10px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	button[type='submit'] {
		background-color: #4caf50;
		color: white;
	}
	button[type='button'] {
		background-color: #f0f0f0;
	}

	/* Neue Styles für scrollbare Slots-Liste */
	.slots-container {
		max-width: 400px;
		margin: 0 auto;
	}

	.scrollable-list {
		height: 200px; /* Anpassbare Höhe */
		overflow-y: auto;
		border: 1px solid #ccc;
		padding: 0;
		list-style-type: none;
	}

	.scrollable-list li {
		padding: 10px;
		border-bottom: 1px solid #eee;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.scrollable-list li:hover {
		background-color: #f0f0f0;
	}

	.scrollable-list li:focus {
		outline: 2px solid blue;
		background-color: #e0e0e0;
	}
</style>
