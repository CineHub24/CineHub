<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import type { PageData, ActionData, SubmitFunction } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let { show, priceSets } = data;

	let moveShowToggle: boolean = $state(false);

	let startTime: string = $state(show.time ?? '');
	let endTime: string = $derived(calculateEndTime());

	// function zurueck() {
	// 	languageAwareGoto(`/admin/film/${show.filmid}`);
	// }
	function toggleMoveShow() {
		moveShowToggle = !moveShowToggle;
	}
	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	}

	function formatTime(timeString: string) {
		const date = new Date(`1970-01-01T${timeString}Z`);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
	function calculateEndTime() {
		const start = new Date(`1970-01-01T${startTime}`);
		const end = new Date(start.getTime() + (show.runtime ?? 0) * 60000);
		return end.toTimeString().slice(0, 5);
	}
</script>

<div class="show-edit-page" style="background-image: url({show.film_backdrop});">
	<div class="show-edit-container">
		{#if show}
			<div class="header">
				<h2>{m.show_for_movie({})}: {show.film_name} {show.cancelled ? `(${m.cancelled({})})` : ''}</h2>
			</div>
			{#if form}
				<div class="message">
					{#if form.timeSlotConflict || form.database}
						<div class="alert">
							{form.message}
							{form.timeSlotConflict
								? `(${formatDate(form.timeSlot.date)}: ${formatTime(
										form.timeSlot.startTime ?? '0'
									)} - ${formatTime(form.timeSlot.endTime ?? '0')})`
								: ''}
						</div>
					{:else if form.rescheduled}
						<div class="confirmation">
							{form.message}:
							<a href="/admin/show/{form.newId}" data-sveltekit-reload class="confirmation-link">{m.new_show({})}</a>
						</div>
					{/if}
				</div>
			{/if}

			<form method="post" name="actions">
				<input type="hidden" name="showId" value={show.id} />
				<input type="hidden" name="hallId" value={show.hallId} />
				<input type="hidden" name="filmId" value={show.filmid} />
				<input type="hidden" name="priceSetId" value={show.priceSet} />
				<input type="hidden" name="filmId" value={show.filmid} />

				<div class="form-columns">
					<div class="form-column">
						<div class="form-group">
							<label for="date">{m.date({})}:</label>
							<input name="date" value={show.date} type="date" readonly />
						</div>

						<div class="form-group">
							<label for="time">{m.start_time({})}:</label>
							<input name="time" bind:value={startTime} type="time" readonly />
						</div>
					</div>
					<div class="form-column">
						<div class="form-group">
							<label for="endTime">{m.end_time({})}:</label>
							<input name="endTime" value={endTime} type="time" readonly />
						</div>

						<div class="form-group">
							<label for="priceSet">{m.price_set({})}:</label>
							<select name="priceSet">
								{#each priceSets as set}
									<option value={set.id} selected={set.id == show.priceSet}>{set.name}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
				<div class="form-actions">
					{#if show.cancelled}
						<button type="submit" formaction="?/uncancel">{m.uncancel({})}</button>
						<button type="submit" formaction="?/delete">{m.delete_something({})}</button>
					{:else}
						<button type="submit" formaction="?/cancel">{m.cancel_show({})}</button>
						<button type="button" onclick={toggleMoveShow}>{m.reschedule({})}</button>
					{/if}
					<!-- <button type="button" onclick={zurueck}>{m.back({})}</button> -->
				</div>
			</form>
		{:else}
			<p class="not-found">{m.show_not_found({})}</p>
		{/if}
	</div>
</div>

{#if moveShowToggle}
	<div class="popup-overlay">
		<div class="popup-content">
			<button class="close-popup" onclick={toggleMoveShow}>&times;</button>
			<h3>{m.reschedule_show({})}</h3>
			<form method="post" action="?/reschedule">
				<input type="hidden" name="showId" value={show.id} />
				<input type="hidden" name="hallId" value={show.hallId} />
				<div class="form-group">
					<label for="date">{m.date({})}:</label>
					<input name="date" value={show.date} type="date" />
				</div>
				<div class="form-group">
					<label for="time">{m.start_time({})}:</label>
					<input name="time" bind:value={startTime} type="time" />
				</div>
				<div class="form-group">
					<label for="endTime">{m.end_time({})}:</label>
					<input name="endTime" value={endTime} type="time" readonly />

					<div class="form-actions">
						<button type="submit">{m.reschedule({})}</button>
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}

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
	.confirmation {
		padding: 1rem;
		border-radius: 8px;
		background-color: #d4edda;
		color: #155724;
		margin-bottom: 1rem;
	}
	.confirmation-link {
		color: #0a3622;
		text-decoration: underline;
		font-weight: bold;
	}

	.confirmation-link:hover {
		color: #051b11;
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
</style>
