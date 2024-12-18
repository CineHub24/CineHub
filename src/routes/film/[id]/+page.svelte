<script lang="ts">
	import type { PageServerData } from './$types';
	import { writable } from 'svelte/store';
	import * as m from '$lib/paraglide/messages.js';
	import ShowsFilmDropdown from '$lib/components/ShowsFilmDropdown.svelte';
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

	function getGermanAgeRating(englishRating : string) {
		switch (englishRating) {
			case 'G':
				return 'FSK 0';
			case 'PG':
				return 'FSK 6';
			case 'PG-13':
				return 'FSK 12';
			case 'R':
				return 'FSK 16';
			case 'NC-17':
				return 'FSK 18';
			default:
				return englishRating;
		}
	}
</script>

{#if movie}
	<div class="movie-details">
		<img id="background" src={movie.backdrop} alt="{movie.title} Poster" />
		<!-- <a href="/film/{hoveredMovie.id}">
		<img id="poster" src={hoveredMovie.poster} alt="{hoveredMovie.title} Poster" /></a
	> -->
		<iframe
			id="poster"
			width="500"
			height="300"
			src={$trailerUrl}
			frameborder="0"
			allow="autoplay; encrypted-media"
			allowfullscreen
			title="Trailer"
		></iframe>
		<h3>{movie.title}</h3>
		<p>{movie.description}</p>
	</div>

	<div class="additional-info">
		<div class="bar-item grey">{m.directed_by({})} {movie.director}</div>
		<div class="bar-item grey">{m.released_in({})} {movie.year}</div>
		<div class="bar-item grey">{movie.runtime} min</div>
		<div class="bar-item grey">{movie.ageRating ? getGermanAgeRating(movie.ageRating) : 'N/A'}</div>
		{#each movie.genres as genre}
			<div class="bar-item bg-blue-600 text-white">{genre}</div>
		{/each}
	</div>

	<!-- <div class="information">
		<div class="details">
			<h1>{movie?.title ?? $page.params.id}</h1>
			<p>{movie.description}</p>
			<p><strong>Erscheinungsdatum:</strong> {movie.year}</p>
			<button class="trailer-button" onclick={fetchTrailer}>Trailer ansehen</button>
		</div>
		<img class="poster" src={movie.poster} alt={movie.title} />
	</div> -->
	<h2 class="px-5 pt-3 text-xl font-bold">{m.shows({})}</h2>
	<ShowsFilmDropdown {shows} movies={[movie]} />
{:else}
	<p>Der Film wurde nicht gefunden.</p>
{/if}

<style>
	.movie-details {
		position: relative;
		overflow: hidden;
		background-color: white;
		padding: 20px;
		padding-bottom: 0;
		border-radius: 10px;
		z-index: 1;
	}

	#background {
		width: 100%;
		height: 450px;
		object-fit: cover;
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
		padding: 20px;
		justify-content: space-around;
	}

	.bar-item {
		padding: 0.5rem 1rem;
		border-radius: 5px;
		margin-bottom: 0.5rem; /* Space between rows of items */
	}

	.grey {
		background-color: #f0f0f0; /* Light gray background */
	}
</style>
