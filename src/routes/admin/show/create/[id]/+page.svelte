<script lang="ts">
	import { enhance } from '$app/forms';
	import type { CinemaHall, Showing } from '$lib/server/db/schema';
	import type { ActionData, PageData, SubmitFunction } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	interface Conflict {
		failed: any;
		blocking: any;
	}

	export let data: PageData;
	const { selectedFilm, priceSets, cinemas } = data;
	let { halls } = data;
	console.log('initial: ' + halls);
	export let form: ActionData;

	let filmRuntime = selectedFilm.runtime;
	let selectedDate = new Date().toISOString().slice(0, 10);
	let priceSet = 0;
	let selectedTimeWindow: { start: string; end: string; duration: number } | null = null;
	let selectedStartTime: string = '';
	let selectedHall: number | null = null;
	let filteredHalls: CinemaHall[] = [];
	let cleaningTime = 15;
	let advertisementTime = 15;

	// Neue Variablen für wiederkehrende Vorstellungen
	let isRecurring = false;
	let recurrenceCount = 1;
	let recurrenceUnit = 'days';
	let recurrenceEndDate = '';

	$: totalDuration = Number(filmRuntime) + cleaningTime + advertisementTime;

	$: if (selectedTimeWindow) {
		selectedStartTime = selectedTimeWindow.start;
	}

	let selectedCinema: number | null = null;

	function handleCinemaSelect(event: Event) {
		console.log('test');
		const select = event.target as HTMLSelectElement;
		selectedCinema = parseInt(select.value);
		filteredHalls = halls.filter((hall) => hall.cinemaId === selectedCinema);
		console.log(filteredHalls);
	}
	function handleTimeWindowSelect(timeWindow: {
		start: string;
		end: string | null;
		duration: number;
	}) {
		selectedTimeWindow = { ...timeWindow, end: timeWindow.end || '' };
	}

	function formatDuration(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}min`;
	}

	function isValidTime(time: string, start: string, end: string): boolean {
		time = time.slice(0, 5);
		start = start.slice(0, 5);
		end = end.slice(0, 5);
		if (!/^\d{2}:\d{2}$/.test(time)) return false;
		console.log('time, start, end');
		console.log(time, start, end);

		const [hours, minutes] = time.split(':').map(Number);
		if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return false;

		const timeDate = new Date(`1970-01-01T${time}`);
		const startDate = new Date(`1970-01-01T${start}`);
		const endDate = new Date(`1970-01-01T${end}`);

		const endTime = new Date(timeDate.getTime() + totalDuration * 60000);
		return timeDate >= startDate && endTime <= endDate;
	}

	function getEndTime(startTime: string): string {
		if (!startTime) return '';
		const start = new Date(`1970-01-01T${startTime}`);

		let end = new Date(start.getTime() + totalDuration * 60000);
		if (end.getHours() == 0 && end.getMinutes() == 0) {
			end = new Date(`1970-01-01T24:00`);
		}
		return end.toTimeString().slice(0, 5);
	}

	$: isValidStartTime = selectedTimeWindow
		? isValidTime(selectedStartTime, selectedTimeWindow.start, selectedTimeWindow.end)
		: false;

	$: calculatedEndTime =
		selectedStartTime && isValidStartTime ? getEndTime(selectedStartTime) : null;

	const enhanceTimeWindows: SubmitFunction = () => {
		return async ({ update }) => {
			const currentRuntime = filmRuntime;
			const currentPriceSet = priceSet;
			const currentHall = selectedHall;
			await update({ reset: false });
			filmRuntime = currentRuntime;
			priceSet = currentPriceSet;
			selectedHall = currentHall;
		};
	};

	let conflicts: Conflict[] = [];
	let successfulShows = [];
	let showConflictPopup = false;

	const enhanceSaveShowing = () => {
		return async ({ result }) => {
			if (result.type === 'success' && result.data.conflicts) {
				conflicts = result.data.conflicts;
				successfulShows = result.data.successfulShows;
				showConflictPopup = true;
			} else if (result.type === 'redirect') {
				// Handle successful save without conflicts
				window.location.href = result.location;
			}
		};
	};

	function handleConflictResolution() {
		// Implement your conflict resolution logic here
		// This could involve letting the user choose which shows to keep or skip
		// After resolution, you might want to try saving the remaining shows again
		showConflictPopup = false;
	}
</script>

<div class="p-4">
	<h1 class="mb-4 text-2xl">{m.plan_screening_time({})}</h1>

	<form
		method="POST"
		action="?/getTimeWindows"
		use:enhance={enhanceTimeWindows}
		class="mb-8 space-y-4"
	>
		<div>
			<label for="cinemaId" class="mb-2 block">{m.cinema({})}</label>
			<select
				name="cinemaId"
				id="cinemaId"
				class="w-full rounded border p-2"
				required
				on:change={handleCinemaSelect}
				bind:value={selectedCinema}
			>
				{#each cinemas as cinema}
					<option value={cinema.id}>{cinema.name}</option>
				{/each}
			</select>
		</div>

		{#if selectedCinema}
			<div>
				<label for="hallId" class="mb-2 block">{m.hall({})}</label>
				<select
					name="hallId"
					id="hallId"
					class="w-full rounded border p-2"
					bind:value={selectedHall}
					required
				>
					<option value="0">{m.select_hall({})}</option>
					{#each filteredHalls as hall}
						<option value={hall.id}>{hall.name}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="date" class="mb-2 block">{m.date({})}</label>
				<input
					type="date"
					name="date"
					id="date"
					bind:value={selectedDate}
					class="w-full rounded border p-2"
					required
				/>
			</div>

			<div>
				<label for="duration" class="mb-2 block">{m.film_duration_minutes({})}</label>
				<input
					type="number"
					name="duration"
					id="duration"
					bind:value={filmRuntime}
					min="1"
					class="w-full rounded border p-2"
					required
				/>
			</div>

			<div>
				<label for="priceset" class="mb-2 block">{m.price_set({})}</label>
				<select name="priceset" id="priceset" required bind:value={priceSet}>
					{#each priceSets as priceSet}
						<option value={priceSet.id}>{priceSet.name}</option>
					{/each}
				</select>
			</div>

			<button type="submit" class="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600">
				{m.search_available_time_windows({})}
			</button>
		{/if}
	</form>

	{#if form?.success && form.timeWindows}
		<div class="mb-8">
			<h2 class="mb-4 text-xl">{m.available_time_windows({})}</h2>
			<div class="space-y-2">
				{#each form.timeWindows as window}
					<button
						class="w-full rounded border p-4 text-left hover:bg-gray-50"
						class:bg-blue-50={selectedTimeWindow?.start === window.start}
						on:click={() =>
							handleTimeWindowSelect({
								start: window.start ?? '',
								end: window.end ?? '',
								duration: window.duration
							})}
					>
						{window.start} - {window.end}
						<span class="ml-2 text-gray-500">
							({formatDuration(window.duration)})
						</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if selectedTimeWindow}
		<div class="mb-8 rounded border bg-gray-50 p-4">
			<h3 class="mb-4 text-lg">{m.choose_start_time({})}</h3>
			<div class="space-y-4">
				<div>
					<p class="mb-2">
						{m.available_time_range({})}: {selectedTimeWindow.start.slice(0, 5)} - {selectedTimeWindow.end.slice(
							0,
							5
						)}
					</p>
					<p class="text-sm text-gray-600">
						{m.required_time({})}: {formatDuration(totalDuration)}
						<span class="text-xs text-gray-500">
							({m.film({})}: {formatDuration(filmRuntime as number)}, {m.cleaning({})}: {formatDuration(
								cleaningTime
							)}, {m.advertisement({})}: {formatDuration(advertisementTime)})
						</span>
					</p>
				</div>

				<div>
					<label for="startTime" class="mb-2 block">{m.start_time_hhmm({})}</label>
					{#if isValidTime(selectedTimeWindow.start, selectedTimeWindow.start, selectedTimeWindow.end)}
						<input
							type="time"
							id="startTime"
							bind:value={selectedStartTime}
							class="w-full rounded border p-2"
							min={selectedTimeWindow.start.slice(0, 5)}
							max={selectedTimeWindow.end.slice(0, 5)}
						/>
					{/if}
				</div>

				{#if selectedStartTime}
					{#if isValidStartTime}
						<div class="rounded bg-green-100 p-2">
							<p>{m.screening_time({})}</p>
							<p>{m.start({})}: {selectedStartTime}</p>
							<p>{m.end({})}: {calculatedEndTime}</p>
							<p class="text-sm text-gray-600">
								{m.total_duration({})}: {formatDuration(totalDuration)}
							</p>
						</div>
					{:else}
						<p class="text-red-500">
							{m.chosen_time_not_fit({ time: formatDuration(totalDuration) })}
						</p>
					{/if}
				{/if}
				{#if showConflictPopup}
<div class="fixed inset-0 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center" id="my-modal">
<div class="bg-white rounded-lg shadow-xl p-6 m-4 max-w-xl w-full">
<h3 class="text-xl font-semibold text-gray-900 mb-4">Konflikte gefunden</h3>
<p class="text-sm text-gray-600 mb-4">
Die folgenden Vorstellungen konnten nicht gespeichert werden:
</p>
<div class="overflow-x-auto">
<table class="min-w-full bg-white">
<thead class="bg-gray-50">
<tr>
<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fehlgeschlagen</th>
<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockiert durch</th>
</tr>
</thead>
<tbody class="divide-y divide-gray-200">
{#each conflicts as conflict}
<tr>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
{conflict.failed.date}<br>
{conflict.failed.startTime} - {conflict.failed.endTime}
</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
<a href="/admin/show/{conflict.blocking.Showing.id}" class="text-blue-600 hover:text-blue-800">
{conflict.blocking.Film.title}<br>
{conflict.blocking.Showing.date}<br>
{conflict.blocking.Showing.time} - {conflict.blocking.Showing.endTime}
</a>
</td>
</tr>
{/each}
</tbody>
</table>
</div>
<p class="mt-4 text-sm text-gray-600">
Erfolgreich gespeicherte Vorstellungen: {successfulShows.length}
</p>
<div class="mt-6 flex justify-end">
<button
class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
on:click={handleConflictResolution}
>
Konflikte auflösen
</button>
</div>
</div>
</div>
{/if}
				{#if isValidStartTime}
					<form method="POST" action="?/saveShowing" use:enhance={enhanceSaveShowing}>
						<input type="hidden" name="startTime" value={selectedStartTime} />
						<input type="hidden" name="endTime" value={calculatedEndTime} />
						<input type="hidden" name="totalDuration" value={totalDuration} />
						<input type="hidden" name="filmId" value={selectedFilm.id} />
						<input type="hidden" name="hallId" value={selectedHall} />
						<input type="hidden" name="date" value={selectedDate} />
						<input type="hidden" name="priceSet" value={priceSet} />

						<div class="mb-4">
							<label class="flex items-center">
								<input type="checkbox" bind:checked={isRecurring} name="isRecurring" class="mr-2" />
								Wiederkehrende Vorstellung
							</label>
						</div>

						{#if isRecurring}
							<div class="space-y-4">
								<div>
									<label for="recurrenceCount" class="mb-2 block">Anzahl der Wiederholungen</label>
									<input
										type="number"
										id="recurrenceCount"
										name="recurrenceCount"
										bind:value={recurrenceCount}
										min="1"
										class="w-full rounded border p-2"
									/>
								</div>

								<div>
									<label for="recurrenceUnit" class="mb-2 block">Einheit</label>
									<select
										id="recurrenceUnit"
										name="recurrenceUnit"
										bind:value={recurrenceUnit}
										class="w-full rounded border p-2"
									>
										<option value="days">Tage</option>
										<option value="weeks">Wochen</option>
										<option value="months">Monate</option>
									</select>
								</div>

								<div>
									<label for="recurrenceEndDate" class="mb-2 block">Enddatum</label>
									<input
										type="date"
										id="recurrenceEndDate"
										name="recurrenceEndDate"
										bind:value={recurrenceEndDate}
										class="w-full rounded border p-2"
									/>
								</div>
							</div>
						{/if}

						<button
							type="submit"
							class="w-full rounded bg-green-500 p-2 text-white hover:bg-green-600"
						>
							{isRecurring ? 'Wiederkehrende Vorstellungen speichern' : 'Vorstellung speichern'}
						</button>
					</form>
				{/if}
			</div>
		</div>
	{/if}

	{#if form?.error}
		<div class="mb-4 rounded bg-red-100 p-4 text-red-700">
			{form.error}
		</div>
	{/if}
</div>
