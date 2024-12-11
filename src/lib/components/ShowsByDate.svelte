<script lang="ts">
	import type { showing } from '$lib/server/db/schema';

	type Show = typeof showing.$inferSelect;

	let { shows } = $props();

	let expandedDates: { [key: string]: boolean } = $state({});

	// Filtere Shows, deren Datum nicht in der Vergangenheit liegt
	const filteredShows = $derived.by(() => 
        shows.filter((show: { date: string | number | Date; }) => {
            const showDate = new Date(show.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return showDate >= today;
        })
    );


	// Gruppiere Shows nach Datum
	const groupedShows = $derived.by(() => {
		return filteredShows.reduce(
		(acc: { [x: string]: any[]; }, show: { date: string | number; }) => {
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
	})

	// Sortiere Daten nach Datum
	const sortedDates = $derived.by(() => {
		return Object.keys(groupedShows).sort(
		(a, b) => new Date(a).getTime() - new Date(b).getTime()
		);
	});
	// Hilfsfunktion zum Formatieren von Datum und Zeit
	function formatShowDetails(show: Show) {
		const timeStr = show.time ? show.time.slice(0, 5) : 'Keine Zeit';
		const endTimeStr = show.endTime ? show.endTime.slice(0, 5) : 'Keine Zeit';
		const languageStr = show.language ? `${show.language}` : '';
		const dimensionStr = show.dimension ? `${show.dimension}` : '';

		return `${timeStr} - ${endTimeStr} ${languageStr} ${dimensionStr}`.trim();
	}

	function toggleDate(date: string) {
		expandedDates[date] = !expandedDates[date];
		expandedDates = expandedDates;
	}
</script>

<div class="shows-container">
	{#each sortedDates as date}
		<div class="collapsible-date-list">
			<button class="date-header" onclick={() => toggleDate(date)}>
				{new Date(date).toLocaleDateString('de-DE', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
				<span class="toggle-icon">
					{expandedDates[date] ? '▼' : '►'}
				</span>
			</button>

			{#if expandedDates[date]}
				<div class="list-content">
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
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.shows-container {
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
	}

	.collapsible-date-list {
		margin-bottom: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.date-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px;
		background-color: #f1f1f1;
		border: none;
		cursor: pointer;
		text-align: left;
	}

	.list-content {
		max-height: 300px;
		overflow-y: auto;
	}

	.scrollable-content {
		padding: 10px;
	}

	.show-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 0;
		border-bottom: 1px solid #eee;
	}

	.show-item:last-child {
		border-bottom: none;
	}

	.hall-info {
		color: #666;
		font-size: 0.8em;
	}

	.toggle-icon {
		margin-left: 10px;
	}
</style>
