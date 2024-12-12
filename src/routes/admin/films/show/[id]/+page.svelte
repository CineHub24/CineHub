<script lang="ts">
	import { goto } from '$app/navigation';
	import { type PageData } from './$types';


	let {data}: {data:PageData} = $props()
	let {show, priceSets} = data
	function zurueck() {
		goto(`/admin/films/film/${show.filmid}`)
	}
</script>


{#if show}
	<div class="container">
		<h2>Vorstellung für Film {show.film_name}</h2>

		<form method="post" action="?/update" name="update">
			<div class="form-group">
				<label for="date">Datum:</label>
				<input name="date" bind:value={show.date} type="date" required />
			</div>

			<div class="form-group">
				<label for="time">Startzeit:</label>
				<input name="time" bind:value={show.time} type="time" required />
			</div>
			<div class="form-group">
				<label for="time">Endzeit:</label>
				<input name="time" bind:value={show.endTime} type="time" readonly />
			</div>
			<div class="form-group">
				<label for="priceSet">Preisset:</label>
				<select name="priceSet">
					{#each priceSets as set}
						<option value={set.id} selected={set.id == show.priceSet}>{set.name} </option>
					{/each}
				</select>
			</div>
			<div class="actions">
				<button type="submit">Speichern</button>
				<button type="button" onclick={zurueck}>Zurück</button>
			</div>
		</form>
		<form action="?/delete" method="POST">
			<button type="submit">Cancel</button>
		</form>
	</div>
{:else}
	<p>Vorstellung nicht gefunden</p>
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
