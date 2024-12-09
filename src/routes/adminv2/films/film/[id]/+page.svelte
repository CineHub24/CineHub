<script>
	import { goto } from '$app/navigation';

	export let data;
	let showAddShowForm = false;
	function toggleShowForm() {
		showAddShowForm = !showAddShowForm;
	}
	let { film } = data;
	let { shows } = data;
	let { slots } = data;

	function zurueck() {
		goto('/adminv2/films');
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
				<button type="button" on:click={zurueck}>Zurück</button>
			</div>
		</form>
	</div>

	<div class="actions">
		<button on:click={toggleShowForm}>+</button>
	</div>

	{#if showAddShowForm}
		<div>
			<form method="post" action="?/create" name="create">
				<div class="form-group">
					<label for="hall">Datum:</label>
					<select name="hall">
						<option value="1">Saal 1</option>
						<option value="2">Saal 2</option>
						<option value="3">Saal 3</option>
					</select>
				</div>
				<div class="form-group">
					<label for="date">Datum:</label>
					<input name="date" type="date" required />
				</div>
				
				<!-- <div class="form-group">
					<label for="time">Startzeit:</label>
					<input name="time" type="time" required />
				</div> -->
				<div class="actions"><button>Erstellen</button></div>
			</form>
		</div>
	{/if}

	<h1>Freie Slots</h1>
	{#if slots && slots.length > 0}
		<div class="slots-container">
			<ul class="scrollable-list">
				{#each slots as slot}
					<li>
						<form action="?/save" method="POST">
						<input type="hidden" name="filmId" value="{film.id}">
						<input type="hidden" name="slotStart" value="{slot.start}">
						<input type="hidden" name="slotEnd" value="{slot.end}">
						<input type="hidden" name="hall" value="{slot.hallid}">
						<input type="hidden" name="date" value="{slot.date}">
						<button>{slot.start} - {slot.end}</button>
						</form>
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<p>Keine freien Slots verfügbar</p>
	{/if}

	<h1>Vorstellungen</h1>
	{#each shows as show}
		<div class="container">
			<a href="/adminv2/films/show/{show.id}">{show.time} - {show.endTime}</a>
		</div>
	{/each}
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