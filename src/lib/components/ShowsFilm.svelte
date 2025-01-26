<script lang="ts">
	import type { showing } from '$lib/server/db/schema';
	import ShowCard from './show_card.svelte';
	import * as m from '$lib/paraglide/messages.js';

	type Show = typeof showing.$inferSelect;

	let { shows, movies } = $props();

	let expandedDates: { [key: string]: boolean } = $state({});

	// Filtere Shows, deren Datum nicht in der Vergangenheit liegt
	const filteredShows = $derived.by(() =>
		shows.filter((show: { date: string | number | Date }) => {
			const showDate = new Date(show.date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return showDate >= today;
		})
	);

	// Gruppiere Shows nach Datum
	const groupedShows = $derived.by(() => {
		return filteredShows.reduce(
			(acc: { [x: string]: any[] }, show: { date: string | number }) => {
				if (show.date) {
					if (!acc[show.date]) {
						acc[show.date] = [];
					}
					acc[show.date].push(show);
				}
				return acc;
			},
			{} as { [key: string]: Show[] }
		);
	});

	// Sortiere Daten nach Datum
	const sortedDates = $derived.by(() => {
		return Object.keys(groupedShows).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
	});

	function defaultExpandAll() {
		for (const date in groupedShows) {
			expandedDates[date] = true;
		}
		expandedDates = expandedDates;
	}

	defaultExpandAll();

	function toggleDate(date: string) {
		expandedDates[date] = !expandedDates[date];
		expandedDates = expandedDates;
	}

	function getMovieByShow(show: Show) {
		return movies.find((movie: { id: number | null }) => movie.id === show.filmid);
	}
</script>

<div class="shows-container">
	{#each sortedDates as date}
		<div class="collapsible-date-list">
			<button class="date-header" onclick={() => toggleDate(date)}>
				<span class="toggle-icon">
					{expandedDates[date] ? '▼' : '►'}
				</span>
				{new Date(date).toLocaleDateString(m.language_date_string({}), {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</button>

			{#if expandedDates[date]}
				<!-- <div class="list-content">
					<div class="scrollable-content">
						{#each groupedShows[date] as show}
							<div class="show-item">
								<a href="/admin/films/show/{show.id}">{formatShowDetails(show)}</a>
								{#if show.hallid}
									<span class="hall-info">Saal {show.hallid}</span>
								{/if}
							</div>
						{/each}
					</div>
				</div> -->
				<div class="movies-container">
					{#each groupedShows[date] as show}
						<ShowCard movie={getMovieByShow(show)} {show} url="/show/{show.id}" />
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.shows-container {
		width: 100%;
		margin: 0 auto;
		padding: 20px;
	}

	.collapsible-date-list {
		margin-bottom: 10px;
	}

	.date-header {
		width: 100%;
		display: flex;
		justify-content: start;
		align-items: center;
		cursor: pointer;
		text-align: left;
		font-weight: 600;
	}

	.toggle-icon {
		margin-right: 10px;
	}

	.movies-container {
		padding-top: 20px;
		margin-left: 20px;
		margin-right: 20px;
		padding-bottom: 20px;
		display: flex; /* Use flexbox for horizontal layout */
		flex-wrap: nowrap; /* Prevent wrapping of items */
		gap: 20px; /* Space between items */
		overflow-x: auto; /* Enable horizontal scrolling */
		scroll-behavior: smooth; /* Smooth scrolling effect */
		width: auto; /* Full width for container */
		box-sizing: border-box; /* Include padding in width */
	}
</style>
