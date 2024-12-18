<script lang="ts">
	import type { showing } from '$lib/server/db/schema';

	let { movie, show, url } = $props();
	type Show = typeof showing.$inferSelect;

	// Hilfsfunktion zum Formatieren von Datum und Zeit
	function formatShowDetails(show: Show) {
		const timeStr = show.time ? show.time.slice(0, 5) : 'Keine Zeit';
		const endTimeStr = show.endTime ? show.endTime.slice(0, 5) : 'Keine Zeit';
		const languageStr = show.language ? `${show.language}` : '';
		const dimensionStr = show.dimension ? `${show.dimension}` : '';

		return `${timeStr} - ${endTimeStr} ${languageStr} ${dimensionStr}`.trim();
	}
</script>

<a href={url}>
	<div class="show-card">
		<img src={movie.poster} alt="{movie.title} Poster" />
		<div class="details">
			<h3 class="title">{movie.title}</h3>
			<!-- <p class="description">{movie.description}</p> -->
			<p class="description">{formatShowDetails(show)}</p>
			<p class="description">Saal {show.hallid}</p>
		</div>
	</div>
</a>

<style>
	.show-card {
		background-color: #f5f5f5;
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
		height: 320px;
		width: 150px;
	}
	.show-card:hover {
		transform: translateY(-5px);
	}
	.show-card img {
		width: 100%;
		height: auto;
	}
	.show-card .details {
		padding: 15px;
	}
	.show-card .title {
		font-size: 1rem;
		text-align: center;
		white-space: nowrap; /* Prevent text wrapping */
		overflow: hidden; /* Hide overflowing text */
		text-overflow: ellipsis; /* Add "..." for overflow */
	}
	.show-card .description {
		font-size: 0.9rem;
		color: #555;
        text-align: center;
	}
</style>
