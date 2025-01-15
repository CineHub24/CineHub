<script lang="ts">
	import type { PageServerData } from './$types';
	import { writable } from 'svelte/store';
	import * as m from '$lib/paraglide/messages.js';
	import ShowsFilm from '$lib/components/ShowsFilm.svelte';
	const apiKey = import.meta.env.VITE_TMDB_API_KEY;

	const { data }: { data: PageServerData } = $props();
	const { movie, shows } = data;

	const trailerUrl = writable<string | null>(null);

	fetchTrailer();

	async function fetchTrailer() {
		if (!$trailerUrl) {
			const tmdbId = movie.tmdbID;
			if (tmdbId) {
				const response = await fetch(
					`https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${apiKey}`
				);
				const data = await response.json();

				if (data.results && data.results.length > 0) {
					const trailer = data.results.find(
						(video: { type: string; site: string }) =>
							video.type === 'Trailer' && video.site === 'YouTube'
					);
					if (trailer) {
						trailerUrl.set(`https://www.youtube.com/embed/${trailer.key}`);
					}
				}
			}
		}
	}

	function getGermanAgeRating(englishRating: string) {
		switch (englishRating) {
			case 'G':
				return m.fsk_0({});
			case 'PG':
				return m.fsk_6({});
			case 'PG-13':
				return m.fsk_12({});
			case 'R':
				return m.fsk_16({});
			case 'NC-17':
				return m.fsk_18({});
			default:
				return englishRating;
		}
	}
</script>

<div class="black-background">
	{#if movie}
		<div class="movie-details">
			<div class="background-overlay">
				<img id="background" src={movie.backdrop} alt={`${movie.title} ${m.movie_poster({})}`} />
			</div>
			<iframe
				id="poster"
				width="500"
				height="300"
				src={$trailerUrl}
				frameborder="0"
				allow="autoplay; encrypted-media"
				allowfullscreen
				title={m.trailer({})}
			></iframe>
			<h3>{movie.title}</h3>
			<p>{movie.description}</p>
		</div>

		<div class="additional-info">
			<div class="bar-item grey">{m.directed_by({})} {movie.director}</div>
			<div class="bar-item grey">{m.released_in({})} {movie.year}</div>
			<div class="bar-item grey">{movie.runtime} min</div>
			<div class="bar-item grey">
				{movie.ageRating ? getGermanAgeRating(movie.ageRating) : 'N/A'}
			</div>
			{#each movie.genres as genre}
				<div class="bar-item bg-blue-600 text-white">{genre}</div>
			{/each}
		</div>

		{#if shows.length > 0}
			<div class="bg-white">
				<ShowsFilmDropdown {shows} movies={[movie]} />
			</div>
		{/if}
	{:else}
		<p>{m.movie_not_found({})}</p>
	{/if}
</div>

<style>
	.black-background {
		background-color: black;
		color: white;
		width: 100%;
		box-sizing: border-box; /* Inklusive Padding im Layout */
	}
	.movie-details {
		position: relative;
		overflow: hidden;
		background-color: white;
		justify-content: flex-end;
		z-index: 1;
	}

	/* Create the gradient overlay */
	.background-overlay {
		position: relative;
		width: 100%;
		height: 70vh; /* 70% der Displayhöhe */
		overflow: hidden;
	}

	#background {
		width: 100%;
		height: auto;
		object-fit: cover;
		display: block;
	}

	/* Gradient for the fade effect */
	.background-overlay::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 60%; /* Adjust height for the fade area */
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%);
		pointer-events: none; /* Ensure it doesn't block interactions */
	}

	#poster {
		position: absolute;
		top: 100px;
		right: 150px;
		border-radius: 10px;
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.7);
		transition: all 0.3s ease; /* Smooth resizing for responsiveness */
		cursor: pointer; /* Change cursor to indicate interactivity */
	}

	.movie-details h3,
	.movie-details p {
		position: absolute;
		color: white;
		text-shadow: 0 3px 6px rgba(0, 0, 0, 0.7);
	}

	.movie-details h3 {
		top: 50px;
		left: 50px;
		font-size: 2rem;
		margin: 0;
		width: 40%;
	}

	.movie-details p {
		bottom: 200px;
		left: 50px;
		font-size: 1.2rem;
		margin: 0;
		width: 40%;
	}

	.additional-info {
		display: flex;
		flex-wrap: wrap; /* Allow items to wrap to the next line */
		gap: 1rem; /* Space between items */
		width: 100%;
		padding: 8px;
		align-items: flex-start; /* Vertikale Ausrichtung (optional) */
		justify-content: flex-start; /* Links ausgerichtet */
	}

	.bar-item {
		padding: 0.5rem 1rem;
		border-radius: 5px;
		margin-bottom: 0.5rem; /* Space between rows of items */
	}

	.grey {
		background-color: rgba(240, 240, 240, 0.15); /* Light gray background with 25% opacity */
	}
</style>
