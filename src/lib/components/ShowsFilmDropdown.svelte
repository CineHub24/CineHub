<script lang="ts">
	// Previous script section remains exactly the same
	import type { showing } from '$lib/server/db/schema';
	import ShowCard from './show_card.svelte';
	import { ChevronLeft, ChevronRight, CalendarDays, Clock } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';

	type Show = typeof showing.$inferSelect;
	let { shows, movies } = $props();

	// State Management
	let currentWeekStart = $state(getWeekStart(new Date()));
	let selectedDate = $state<Date>(new Date());

	// Derived values
	const filteredShows = $derived.by(() =>
		shows.filter((show: { date: string | number | Date }) => {
			const showDate = new Date(show.date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return showDate >= today;
		})
	);

	const selectedShows = $derived.by(() => getShowsForDate(selectedDate));

	function getWeekStart(date: Date) {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1);
		return new Date(d.setDate(diff));
	}

	function getWeekDates(startDate: Date) {
		const dates = [];
		const currentDate = new Date(startDate);

		for (let i = 0; i < 7; i++) {
			dates.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}
		return dates;
	}

	function navigateWeek(direction: number) {
		const newDate = new Date(currentWeekStart);
		newDate.setDate(newDate.getDate() + direction * 7);
		currentWeekStart = newDate;
	}

	function goToCurrentWeek() {
		currentWeekStart = getWeekStart(new Date());
		selectedDate = new Date();
	}

	function getShowsForDate(date: Date) {
		return filteredShows
			.filter((show: { date: string | number | Date }) => {
				const showDate = new Date(show.date);
				return showDate.toDateString() === date.toDateString();
			})
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	}

	function isToday(date: Date) {
		return new Date().toDateString() === date.toDateString();
	}

	function getMovieByShow(show: Show) {
		return movies.find((movie: { id: number | null }) => movie.id === show.filmid);
	}

	function selectDate(date: Date) {
		selectedDate = date;
	}

	function formatTime(startTime: string, endTime: string) {
		return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
	}
</script>

<div class="mx-auto mb-4 px-4 py-2 sm:px-6 lg:px-8">
	<div class="flex h-[650px] flex-col overflow-hidden rounded-xl bg-white">
		<!-- Calendar Header -->
		<div class="flex items-center justify-between border-b p-4">
			<h2 class="text-xl font-semibold text-gray-800">
				{currentWeekStart.toLocaleDateString(m.language_date_string({}), { month: 'long', year: 'numeric' })}
			</h2>
			<div class="flex items-center space-x-4">
				<button
					class="flex items-center rounded-md bg-blue-50 px-3 py-1.5 text-blue-600 transition-colors hover:bg-blue-100"
					onclick={goToCurrentWeek}
				>
					<CalendarDays class="mr-2 h-4 w-4" />
					{m.today({})}
				</button>
				<div class="flex space-x-2">
					<button
						class="rounded-full p-2 transition-colors hover:bg-gray-100"
						onclick={() => navigateWeek(-1)}
					>
						<ChevronLeft class="h-5 w-5 text-gray-600" />
					</button>
					<button
						class="rounded-full p-2 transition-colors hover:bg-gray-100"
						onclick={() => navigateWeek(1)}
					>
						<ChevronRight class="h-5 w-5 text-gray-600" />
					</button>
				</div>
			</div>
		</div>

		<!-- Main Content Area -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Calendar Days - Fixed width with own scroll -->
			<div class="w-80 overflow-y-auto border-r">
				{#each getWeekDates(currentWeekStart) as date}
					{@const shows = getShowsForDate(date)}
					<button
						class={`group w-full border-b p-4 transition-colors last:border-b-0 ${
							selectedDate.toDateString() === date.toDateString()
								? 'bg-blue-50 hover:bg-blue-100'
								: 'hover:bg-gray-50'
						}`}
						onclick={() => selectDate(date)}
					>
						<div class="flex items-center justify-between">
							<div class="flex flex-col items-start">
								<div class="text-sm font-medium text-gray-600">
									{date.toLocaleDateString(m.language_date_string({}), { weekday: 'long' })}
								</div>
								<div
									class={`text-xl ${isToday(date) ? 'font-semibold text-blue-600' : 'text-gray-900'}`}
								>
									{date.getDate()}
								</div>
							</div>
							{#if shows.length > 0}
								<span
									class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800"
								>
									{shows.length}
									{m.shows({})}
								</span>
							{/if}
						</div>
					</button>
				{/each}
			</div>

			<!-- Shows Section - Flexible width with fixed header -->
			<div class="flex min-w-0 flex-1 flex-col">
				<!-- Shows Header - Always visible -->
				<div class="border-b bg-white p-6">
					<h3 class="text-xl font-semibold text-gray-800">
						{m.showings_on({})}
						{selectedDate.toLocaleDateString(m.language_date_string({}), {
							weekday: 'long',
							day: 'numeric',
							month: 'long'
						})}
					</h3>
				</div>

				<!-- Shows Content - Scrollable -->
				<div class="flex-1 overflow-y-auto p-6">
					{#if selectedShows.length === 0}
						<div class="py-12 text-center">
							<div class="text-lg text-gray-400">{m.no_showings_today({})}</div>
						</div>
					{:else}
						<div class="space-y-6">
							{#each selectedShows as show}
								{@const movie = getMovieByShow(show)}
								<div
									class="group relative rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md"
								>
									<div class="p-4">
										<div class="flex items-start gap-4">
											<!-- svelte-ignore a11y_missing_attribute -->
											<img
												src={movie?.poster}
												class="h-36 w-24 flex-shrink-0 rounded-lg bg-gray-200"
											/>

											<div class="min-w-0 flex-1">
												<div class="mb-2 flex flex-wrap items-center gap-3">
													<span
														class="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800"
													>
														{show.hallName}
													</span>
													<span
														class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
													>
														<Clock class="mr-1 h-4 w-4" />
														{formatTime(show.time, show.endTime)}
													</span>
													{#if show.is3d}
														<span
															class="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800"
														>
															3D
														</span>
													{/if}
													{#if show.isOv}
														<span
															class="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
														>
															OV
														</span>
													{/if}
												</div>

												<h3 class="mb-1 text-lg font-semibold text-gray-900">
													{movie?.title || m.film_title({})}
												</h3>

												<p class="mb-3 text-sm text-gray-600">
													{movie?.description?.slice(0, 150)}...
												</p>

												<div class="flex items-center gap-4">
													<a
														href={`/show/${show.id}`}
														class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
													>
														{m.book_tickets({})}
													</a>
													<a
														href={`/film/${movie?.id}`}
														class="text-sm text-blue-600 hover:underline"
													>
														{m.more_information({})}
													</a>
												</div>
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
