<script lang="ts">
	import { fade, crossfade } from 'svelte/transition';
	import MovieCard from '../lib/components/movie_card.svelte';
	import ShowsFilmDropdown from '$lib/components/ShowsFilmDropdown.svelte';
	import type { PageServerData } from './$types';
	import type { Film, Showing } from '$lib/server/db/schema';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { showNotification } from '$lib/stores/notification';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

	const apiKey = import.meta.env.VITE_TMDB_API_KEY;

	const [send, receive] = crossfade({
    duration: 800,
    easing: cubicOut
  });

	const { data }: { data: PageServerData } = $props();

	let movies: FilmWithTrailer[] = data.movies;

	let shows: Showing[] = data.shows;

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

	const funFacts = [
		{
			title: 'Popcorn-Fakt',
			text: 'Wusstest du, dass Popcorn erst im 20. Jahrhundert in Kinos populär wurde?',
			image: '/popcorn.jpeg'
		},
		{
			title: 'Filmrollen-Info',
			text: 'Früher wurden Filme auf brennbarem Nitratfilm gespeichert. Zum Glück ist das heute anders!',
			image: '/filmrolle.jpeg'
		},
		{
			title: 'Ton im Kino',
			text: 'Der erste Tonfilm wurde bereits 1927 uraufgeführt. Ein Meilenstein der Filmgeschichte!',
			image: '/tonfilm.jpeg'
		}
	];
</script>

{#key hoveredMovie}
  <div class="movie-details" in:fade={{ duration: 1500 }}>
    <!-- Backdrop mit crossfade Animation -->
    {#key hoveredMovie.backdrop}
      <img
        id="background"
        src={hoveredMovie.backdrop}
        alt={`${hoveredMovie.title} ${m.movie_poster({})}`}
        in:receive={{ key: 'backdrop' }}
        out:send={{ key: 'backdrop' }}
      />
    {/key}

    <iframe
      id="poster"
      width="500"
      height="300"
      src={hoveredMovie.trailer}
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen
      title={m.trailer_title({})}
    ></iframe>
    <h3>{hoveredMovie.title}</h3>
    <p>{hoveredMovie.description}</p>
  </div>
{/key}

<!-- <h2 class="px-5 text-2xl font-bold mt-4">
    {m.movies({})}
</h2> -->

<div class="relative overflow-x-auto">
    <!-- Horizontal scrollbare Liste -->
    <div class="movies-container mt-4 flex items-center justify-between relative">
		<div class="movies-list flex items-center gap-4">
			{#each movies as movie}
				<div
					role="button"
					tabindex="0"
					onmouseover={() => {
						if (hoveredMovie.id !== movie.id) {
							hoveredMovie = { ...movie };
						}
					}}
					onfocus={() => {
						if (hoveredMovie.id !== movie.id) {
							hoveredMovie = { ...movie };
						}
					}}
					class="movie-card"
				>
					<MovieCard {movie} url="/film/{movie.id}" />
				</div>
			{/each}
		</div>
	</div>

    <!-- Rechts positionierter Button -->
    <a
    href="/all"
    class="absolute top-1/2 right-8 transform -translate-y-1/2 flex h-16 w-16 items-center justify-center
           rounded-full bg-gray-100 border border-gray-300
           hover:border-gray-400 transition duration-150 ease-in-out
           focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label="Alle Filme anzeigen"
>
    <img
        src="right-arrow.png"
        alt="Pfeil nach rechts"
        class="h-8 w-8 opacity-60"
    />
</a>

</div>


<br />
{#if shows.length > 0}
	<div class="relative pt-4">
		<div class="absolute inset-0 flex items-center px-8" aria-hidden="true">
			<div class="w-full border-t border-gray-200/80"></div>
		</div>
		<div class="relative flex justify-center">
			<h2 class="bg-white px-6 text-4xl font-bold text-gray-900">
				{m.shows({})}
			</h2>
		</div>
	</div>
	<ShowsFilmDropdown {shows} {movies} />
{/if}





<div class="relative pt-6">
	<div class="absolute inset-0 flex items-center px-8" aria-hidden="true">
		<div class="w-full border-t border-gray-200/80"></div>
	</div>
	<div class="relative flex justify-center">
		<h2 class="bg-white px-6 text-4xl font-bold text-gray-900">CineHub Gutscheine</h2>
	</div>
</div>


<!-- @Mika hier bitte Gutscheine anzeigen -->



<div class="relative pt-6">
	<div class="absolute inset-0 flex items-center px-8" aria-hidden="true">
		<div class="w-full border-t border-gray-200/80"></div>
	</div>
	<div class="relative flex justify-center">
		<h2 class="bg-white px-6 text-4xl font-bold text-gray-900">Schon Gewusst?</h2>
	</div>
</div>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
	<div class="text-center">
		<p class="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
			Entdecke spannende Hintergrundinformationen und Kuriositäten aus der Welt des Films.
		</p>
	</div>

	<div class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
		{#each funFacts as fact}
			<div
				class="overflow-hidden rounded-lg bg-white shadow-lg transition-transform duration-300 hover:scale-105"
			>
				{#if fact.image}
					<img src={fact.image} alt={fact.title} class="h-48 w-full object-cover" />
				{/if}
				<div class="p-6">
					<h3 class="mb-2 text-xl font-semibold text-gray-900">
						{fact.title}
					</h3>
					<p class="text-gray-600">
						{fact.text}
					</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.movies-container {
		padding-top: 10px;
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
		z-index: 1;
	}

	#background {
		width: 100%;
		height: 550px;
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


	.container {
        position: relative;
        display: inline-block; /* Passt sich der Größe des Buttons an */
    }

    .main-button {
        padding: 10px 20px;
        font-size: 16px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .overlay-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 8px 16px;
        font-size: 14px;
        background-color: #ffc107;
        color: black;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1; /* Stellt sicher, dass der Button oben ist */
    }
</style>
