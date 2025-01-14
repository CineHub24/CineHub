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
	const units = ['Tag', 'Woche', 'Monat'];
	let filmRuntime = selectedFilm.runtime;
	let selectedDate = new Date().toISOString().slice(0, 10);
	let priceSet = 0;
	let selectedTimeWindow: { start: string; end: string; duration: number } | null = null;
	let selectedStartTime: string = '';
	let selectedHall: number | null = null;
	let filteredHalls: CinemaHall[] = [];
	let cleaningTime = 15;
	let advertisementTime = 15;
	let showPopup = false;
	let repeatEvery = 1;
	let repeatUnit = 'Woche';

	function openPopup() {
		showPopup = true;
	}

	function closePopup() {
		showPopup = false;
		isRecurring = false;
	}

	function handleSubmit() {
		// Hier können Sie die Logik zum Speichern der Wiederholung implementieren
		isRecurring = true;
		showPopup = false;
	}

	// Neue Variablen für wiederkehrende Vorstellungen
	let isRecurring = false;
	let recurrenceCount = 1;
	let recurrenceUnit = 'days';
	let recurrenceEndDate = '';
	let endDate = '';

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

<div class="mx-auto max-w-7xl p-6">
	<h1 class="mb-6 text-3xl font-bold text-gray-800">{m.plan_screening_time({})}</h1>

	<div class="flex flex-col gap-6 md:flex-row">
		<div class="w-full rounded-lg bg-white p-6 shadow-lg md:w-1/2">
			<form
				method="POST"
				action="?/getTimeWindows"
				use:enhance={enhanceTimeWindows}
				class="space-y-6"
			>
				<div class="space-y-4">
					<div>
						<label for="cinemaId" class="mb-1 block text-sm font-medium text-gray-700"
							>{m.cinema({})}</label
						>
						<select
							name="cinemaId"
							id="cinemaId"
							class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
							<label for="hallId" class="mb-1 block text-sm font-medium text-gray-700"
								>{m.hall({})}</label
							>
							<select
								name="hallId"
								id="hallId"
								class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
							<label for="date" class="mb-1 block text-sm font-medium text-gray-700"
								>{m.date({})}</label
							>
							<input
								type="date"
								name="date"
								id="date"
								bind:value={selectedDate}
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								required
							/>
						</div>

						<div>
							<label for="duration" class="mb-1 block text-sm font-medium text-gray-700"
								>{m.film_duration_minutes({})}</label
							>
							<input
								type="number"
								name="duration"
								id="duration"
								bind:value={filmRuntime}
								min="1"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								required
							/>
						</div>

						<div>
							<label for="priceset" class="mb-1 block text-sm font-medium text-gray-700"
								>{m.price_set({})}</label
							>
							<select
								name="priceset"
								id="priceset"
								required
								bind:value={priceSet}
								class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
							>
								{#each priceSets as priceSet}
									<option value={priceSet.id}>{priceSet.name}</option>
								{/each}
							</select>
						</div>
					{/if}
				</div>

				<button
					type="submit"
					class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				>
					{m.search_available_time_windows({})}
				</button>
			</form>
		</div>

		<div class="w-full rounded-lg bg-white p-6 shadow-lg md:w-1/2">
			{#if form?.success && form.timeWindows}
				<div>
					<h2 class="mb-4 text-xl font-semibold text-gray-800">{m.available_time_windows({})}</h2>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{#each form.timeWindows as window}
							<button
								class="rounded-lg border p-4 text-left transition-colors duration-150 ease-in-out hover:bg-gray-50"
								class:bg-indigo-100={selectedTimeWindow?.start === window.start}
								on:click={() =>
									handleTimeWindowSelect({
										start: window.start ?? '',
										end: window.end ?? '',
										duration: window.duration
									})}
							>
								<div class="font-medium">{window.start} - {window.end}</div>
								<div class="text-sm text-gray-500">
									({formatDuration(window.duration)})
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if selectedTimeWindow}
				<div class="mt-8 rounded-lg bg-gray-50 p-6 shadow">
					<h3 class="mb-4 text-lg font-semibold text-gray-800">{m.choose_start_time({})}</h3>
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
							<label for="startTime" class="mb-1 block text-sm font-medium text-gray-700"
								>{m.start_time_hhmm({})}</label
							>
							{#if isValidTime(selectedTimeWindow.start, selectedTimeWindow.start, selectedTimeWindow.end)}
								<input
									type="time"
									id="startTime"
									bind:value={selectedStartTime}
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									min={selectedTimeWindow.start.slice(0, 5)}
									max={selectedTimeWindow.end.slice(0, 5)}
								/>
							{/if}
						</div>

						{#if selectedStartTime}
							{#if isValidStartTime}
								<div class="rounded bg-green-100 p-4">
									<p class="font-medium">{m.screening_time({})}</p>
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

						{#if isValidStartTime}
							<form
								method="POST"
								action="?/saveShowing"
								use:enhance={enhanceSaveShowing}
								class="space-y-4"
							>
								<input type="hidden" name="startTime" value={selectedStartTime} />
								<input type="hidden" name="endTime" value={calculatedEndTime} />
								<input type="hidden" name="totalDuration" value={totalDuration} />
								<input type="hidden" name="filmId" value={selectedFilm.id} />
								<input type="hidden" name="hallId" value={selectedHall} />
								<input type="hidden" name="date" value={selectedDate} />
								<input type="hidden" name="priceSet" value={priceSet} />

								<input type="hidden" name="isRecurring" value={isRecurring} />
								<input type="hidden" name="repeatEvery" value={repeatEvery} />
								<input type="hidden" name="repeatUnit" value={repeatUnit} />
								<input type="hidden" name="endDate" value={endDate} />

								<div>
									<label class="flex items-center">
										<input
											type="checkbox"
											bind:checked={isRecurring}
											class="mr-2"
											on:change={openPopup}
										/>
										Wiederkehrende Vorstellung
									</label>
								</div>

								{#if isRecurring}
									<div class="mb-4 rounded bg-gray-100 p-4">
										<p>Wiederholen alle {repeatEvery} {repeatUnit}{repeatEvery > 1 ? 'e' : ''}</p>
										<p>Enddatum: {endDate}</p>
									</div>
								{/if}

								<button
									type="submit"
									class="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
								>
									{isRecurring ? 'Wiederkehrende Vorstellungen speichern' : 'Vorstellung speichern'}
								</button>
							</form>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>

	{#if form?.error}
		<div class="mt-4 border-l-4 border-red-500 bg-red-100 p-4 text-red-700">
			<p class="font-bold">Error</p>
			<p>{form.error}</p>
		</div>
	{/if}
</div>

{#if showPopup}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h2 class="mb-4 text-2xl font-bold">Benutzerdefinierte Wiederholung</h2>

			<div class="mb-4">
				<div class="mb-2 flex items-center">
					<span class="mr-2">Wiederholen alle</span>
					<input type="number" bind:value={repeatEvery} min="1" class="w-16 rounded border p-2" />
					<div class="relative ml-2 flex-grow">
						<select
							bind:value={repeatUnit}
							class="w-full appearance-none rounded border bg-white p-2 pr-8"
						>
							{#each units as unit}
								<option value={unit}>{unit}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="mt-2 flex items-center">
					<span class="mr-2">Enddatum:</span>
					<input type="date" bind:value={endDate} class="rounded border p-2" min={selectedDate} />
				</div>
			</div>

			<div class="flex justify-end space-x-2">
				<button
					type="button"
					on:click={closePopup}
					class="rounded border px-4 py-2 text-gray-600 hover:bg-gray-100"
				>
					Abbrechen
				</button>
				<button
					type="button"
					on:click={handleSubmit}
					class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				>
					Bestätigen
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showConflictPopup}
	<div
		class="fixed inset-0 flex h-full w-full items-center justify-center overflow-y-auto bg-gray-600 bg-opacity-50"
		id="my-modal"
	>
		<div class="m-4 w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
			<h3 class="mb-4 text-xl font-semibold text-gray-900">Konflikte gefunden</h3>
			<p class="mb-4 text-sm text-gray-600">
				Die folgenden Vorstellungen konnten nicht gespeichert werden:
			</p>
			<div class="overflow-x-auto">
				<table class="min-w-full bg-white">
					<thead class="bg-gray-50">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>Fehlgeschlagen</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>Blockiert durch</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each conflicts as conflict}
							<tr>
								<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
									{conflict.failed.date}<br />
									{conflict.failed.startTime} - {conflict.failed.endTime}
								</td>
								<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
									<a
										href="/admin/show/{conflict.blocking.Showing.id}"
										target="_blank"
										class="text-blue-600 hover:text-blue-800"
									>
										{conflict.blocking.Film.title}<br />
										{conflict.blocking.Showing.date}<br />
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
					class="rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
					on:click={handleConflictResolution}
				>
					Schließen
				</button>
			</div>
		</div>
	</div>
{/if}
