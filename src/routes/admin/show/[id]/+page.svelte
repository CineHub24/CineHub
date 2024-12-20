<script lang="ts">
	import { goto } from '$app/navigation';
	import { type PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { show, priceSets } = data;

	function zurueck() {
		goto(`/admin/film/${show.filmid}`);
	}
</script>

<div class="show-edit-page" style="background-image: url({show.film_backdrop});">
	<div class="show-edit-container">
		{#if show}
			<div class="header">
				<h2>Vorstellung für Film {show.film_name}</h2>
			</div>

			<form method="post" name="update">
				<div class="form-columns">
					<div class="form-column">
						<div class="form-group">
							<label for="date">Datum:</label>
							<input name="date" value={show.date} type="date" readonly />
						</div>

						<div class="form-group">
							<label for="time">Startzeit:</label>
							<input name="time" value={show.time} type="time" readonly />
						</div>
					</div>
					<div class="form-column">
						<div class="form-group">
							<label for="endTime">Endzeit:</label>
							<input name="endTime" value={show.endTime} type="time" readonly />
						</div>

						<div class="form-group">
							<label for="priceSet">Preisset:</label>
							<select name="priceSet">
								{#each priceSets as set}
									<option value={set.id} selected={set.id == show.priceSet}>{set.name}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
				<div class="form-actions">
					<button type="submit" formaction="?/update">Speichern</button>
					<button type="submit" formaction="?/cancel">Absagen</button>
					<button type="submit" formaction="?/reschedule">Verschieben</button>
					<button type="button" onclick={zurueck}>Zurück</button>
				</div>
			</form>
		{:else}
			<p class="not-found">Vorstellung nicht gefunden</p>
		{/if}
	</div>
</div>

<style>
	.show-edit-page {
		width: 100%;
		padding: 20px;
		box-sizing: border-box;
	}

	.show-edit-container {
		width: 100%;
		max-width: 1200px;
		min-height: 75vh;
		margin: 0 auto;
		background-color: white;
		padding: 40px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
	}

	.header {
		margin-bottom: 30px;
		padding-bottom: 15px;
		border-bottom: 1px solid #eee;
	}

	.header h2 {
		margin: 0;
		font-size: 1.8em;
		color: #333;
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
	.form-group select {
		width: 100%;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1em;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
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

	.form-actions button:hover {
		background-color: #0056b3;
	}

	.delete-section {
		text-align: center;
		padding: 20px;
	}

	.not-found {
		text-align: center;
		color: #666;
		font-size: 1.2em;
		padding: 50px;
	}
</style>
