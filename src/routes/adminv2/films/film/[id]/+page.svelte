<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let data;
	let showAddShowForm = false;
	function toggleShowForm() {
		showAddShowForm = !showAddShowForm;
	}
	let { filme } = data;
	let { shows } = data;

	$: film = filme.find((f) => f.id === parseInt($page.params.id));

	function speichern() {
		// In einer echten Anwendung würden Sie hier die Daten speichern
		console.log('Film gespeichert:', film);
		goto('/');
	}

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
				<input name="genre" bind:value={film.genre} type="text" required />
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
	<div>
		<h1>Vorstellungen</h1>
	</div>
	<div class="actions">
		<button on:click={toggleShowForm}>+</button>
	</div>

	{#if showAddShowForm}
		<div>
			<form method="post" action="?/create" name="create">
				<div class="form-group">
					<label for="date">Datum:</label>
					<input name="date" type="date" required />
				</div>

				<div class="form-group">
					<label for="time">Startzeit:</label>
					<input name="time" type="time" required />
				</div>
				<div class="actions"><button>Erstellen</button></div>
			</form>
		</div>
	{/if}

	{#each shows as show}
		<div class="container">
			<a href="/adminv2/films/show/{show.Showing.id}">{show.Showing.id}</a>
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
</style>
