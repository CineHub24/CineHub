<script lang="ts">
	import { fade } from 'svelte/transition';
	import MovieCard from '../lib/components/movie_card.svelte';
	import type { PageServerData } from './$types';
	import type { Film } from '$lib/server/db/schema';
	import { onMount } from 'svelte';
	const apiKey = import.meta.env.VITE_TMDB_API_KEY;

	const { data }: { data: PageServerData } = $props();
	let movies: FilmWithTrailer[] = data.movies;
	type FilmWithTrailer = Film & {
		trailer?: string; // Optionales Trailer-Attribut
	};

	let hoveredMovie: FilmWithTrailer = $state(movies[0]); // The currently hovered movie object

	async function getTrailers() {
		for (const movie of movies) {
			if (movie.tmdbID) {
				const trailer = await fetchTrailer(movie.tmdbID);
				movie.trailer = trailer;
			}
		}
		hoveredMovie = { ...movies[0] }; // Update the hovered movie with the trailer
	}

	onMount(() => {
		getTrailers();
	});

	async function fetchTrailer(tmdbId: string) {
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
					return `https://www.youtube.com/embed/${trailer.key}`;
				}
			}
		}
	}
</script>

{#key hoveredMovie}
	<div class="movie-details" in:fade={{ duration: 1000 }}>
		<img id="background" src={hoveredMovie.backdrop} alt="{hoveredMovie.title} Poster" />
		<!-- <a href="/film/{hoveredMovie.id}">
			<img id="poster" src={hoveredMovie.poster} alt="{hoveredMovie.title} Poster" /></a
		> -->
		<iframe
			id="poster"
			width="500"
			height="300"
			src={hoveredMovie.trailer}
			frameborder="0"
			allow="autoplay; encrypted-media"
			allowfullscreen
			title="Trailer"
		></iframe>
		<h3>{hoveredMovie.title}</h3>
		<p>{hoveredMovie.description}</p>
	</div>
{/key}

<h2 class="px-5 text-xl font-bold">Movies</h2>
<div class="movies-container">
	{#each movies as movie}
		<div
			role="button"
			tabindex="0"
			onmouseover={() => (hoveredMovie = { ...movie })}
			onfocus={() => (hoveredMovie = { ...movie })}
			class="movie-card"
		>
			<MovieCard {movie} url="film/{movie.id}" />
		</div>
	{/each}
</div>
<br />
<h2 class="px-5 text-xl font-bold">Showings</h2>
<div class="movies-container">
	{#each movies as movie}
		<MovieCard {movie} url="film/{movie.id}" />
	{/each}
</div>

<style>
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

	.movie-details {
		position: relative;
		overflow: hidden;
		background-color: white;
		padding: 20px;
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

	/* Responsive styles */
	@media (max-width: 768px) {
		#background {
			height: 300px; /* Reduce the height on smaller screens */
		}

		#poster {
			top: 150px;
			right: 50%; /* Center horizontally */
			transform: translateX(50%);
			width: 150px; /* Reduce size */
		}

		.movie-details h3 {
			top: 20px;
			left: 20px;
			font-size: 1.5rem;
			width: 80%; /* Allow more width for text */
		}

		.movie-details p {
			bottom: 20px;
			left: 20px;
			font-size: 1rem;
			width: 80%;
		}
	}

	@media (max-width: 480px) {
		#background {
			height: 200px;
		}

		#poster {
			top: 100px;
			right: 50%;
			transform: translateX(50%);
			width: 120px;
		}

		.movie-details h3 {
			top: 10px;
			left: 10px;
			font-size: 1.2rem;
			width: 90%;
		}

		.movie-details p {
			bottom: 10px;
			left: 10px;
			font-size: 0.9rem;
			width: 90%;
		}
	}
</style>
