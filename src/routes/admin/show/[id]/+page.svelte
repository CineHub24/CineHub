<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData, ActionData, SubmitFunction } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let { show, priceSets } = data;

	console.log(form);
	function zurueck() {
		goto(`/admin/film/${show.filmid}`);
	}
	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	}

	function formatTime(timeString: string) {
		const date = new Date(`1970-01-01T${timeString}Z`);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="show-edit-page" style="background-image: url({show.film_backdrop});">
	<div class="show-edit-container">
		{#if show}
			<div class="header">
				<h2>Vorstellung für Film {show.film_name} {show.cancelled ? '(Abgesagt)' : ''}</h2>
			</div>
			{#if form}
				<div class="message">
					{#if form.timeSlotConflict}
						<div class="alert">
							{form.message} ({formatDate(form.timeSlot.date)}: {formatTime(form.timeSlot.startTime ?? '0')} - {formatTime(form.timeSlot.endTime ?? '0')})
						</div>
					{/if}
				</div>
			{/if}

			<form method="post" name="actions">
				<input type="hidden" name="showId" value={show.id} />
				<input type="hidden" name="hallId" value={show.hallId} />
				<input type="hidden" name="filmId" value={show.filmid} />
				<div class="form-columns">
					<div class="form-column">
						<div class="form-group">
							<label for="date">Datum:</label>
							<input name="date" value={show.date} type="date" readonly={!form?.message} />
						</div>

						<div class="form-group">
							<label for="time">Startzeit:</label>
							<input name="time" value={show.time} type="time" readonly={!form?.message} />
						</div>
					</div>
					<div class="form-column">
						<div class="form-group">
							<label for="endTime">Endzeit:</label>
							<input name="endTime" value={show.endTime} type="time" readonly={!form?.message} />
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
					{#if show.cancelled}
						<button type="submit" formaction="?/uncancel">Wiederherstellen</button>
						<button type="submit" formaction="?/delete">Löschen</button>
					{:else}
						<button type="submit" formaction="?/cancel">Absagen</button>
					{/if}
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
	.not-found {
		text-align: center;
		color: #666;
		font-size: 1.2em;
		padding: 50px;
	}
	.alert {
		padding: 1rem;
		border-radius: 8px;
		background-color: #f8d7da;
		color: #721c24;
		margin-bottom: 1rem;
	}
</style>
