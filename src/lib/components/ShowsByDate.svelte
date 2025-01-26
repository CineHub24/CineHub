<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { CirclePlus } from 'lucide-svelte';
	import type { showing } from '$lib/server/db/schema';
	import * as m from '$lib/paraglide/messages.js';

	type Show = typeof showing.$inferSelect;

	let { shows } = $props();

	let expandedDates: { [key: string]: boolean } = $state({});

	const filteredShows = $derived.by(() =>
		shows.filter((show: { date: string | number | Date }) => {
			const showDate = new Date(show.date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return showDate >= today;
		})
	);

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

	const sortedDates = $derived.by(() => {
		return Object.keys(groupedShows).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
	});

	function formatShowDetails(show: Show) {
		const timeStr = show.time ? show.time.slice(0, 5) : 'TBA';
		const endTimeStr = show.endTime ? show.endTime.slice(0, 5) : 'TBA';
		const languageStr = show.language || '';
		const dimensionStr = show.dimension || '';

		return `${timeStr} - ${endTimeStr} ${languageStr} ${dimensionStr}`.trim();
	}

	function toggleDate(date: string) {
		expandedDates[date] = !expandedDates[date];
		expandedDates = expandedDates;
	}
</script>

<div class="shows-container">
	{#each sortedDates as date}
		<div class="date-group">
			<button class="date-header" onclick={() => toggleDate(date)}>
				<span class="date-text">
					{new Date(date).toLocaleDateString(m.language_date_string({}), {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</span>
				<span class="toggle-icon" class:expanded={expandedDates[date]}> ▼ </span>
			</button>

			{#if expandedDates[date]}
				<div class="show-list" transition:fly={{ y: -20, duration: 300 }}>
					{#each groupedShows[date] as show}
						<div class="show-item" transition:fade>
							<a href="/admin/show/{show.id}" class="show-link">
								<span class="show-details">
									{#if show.cancelled}
										<span class="show-time">{formatShowDetails(show)} ({m.cancelled({})})</span>
									{:else}
										<span class="show-time">{formatShowDetails(show)}</span>
									{/if}

									{#if show.hallid}
										<span class="hall-info">{m.hall({}) + ' ' + show.hallid}</span>
									{/if}
								</span>
							</a>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.shows-container {
		width: 100%;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	.date-group {
		margin-bottom: 1rem;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		background-color: #fff;
	}

	.date-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background-color: #f8f9fa;
		border: none;
		cursor: pointer;
		text-align: left;
		font-weight: bold;
		transition: background-color 0.3s ease;
	}

	.date-header:hover {
		background-color: #e9ecef;
	}

	.toggle-icon {
		transition: transform 0.3s ease;
	}

	.toggle-icon.expanded {
		transform: rotate(180deg);
	}

	.show-list {
		padding: 0.5rem 1rem;
	}

	.show-item {
		padding: 0.75rem 0;
		border-bottom: 1px solid #e9ecef;
	}

	.show-item:last-child {
		border-bottom: none;
	}

	.show-link {
		display: block;
		color: #212529;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.show-link:hover {
		color: #007bff;
	}

	.show-details {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem; /* Verringert den Abstand zwischen Zeit und Saal */
	}

	.show-time {
		font-weight: 500;
	}

	.hall-info {
		font-size: 0.875rem;
		color: #6c757d;
	}
</style>
