<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageServerData } from './$types';
	import { writable } from 'svelte/store';
	import TrailerPopup from '$lib/components/trailerPopup.svelte';

	const { data }: { data: PageServerData } = $props();
	const { movie, shows } = data;

	const trailerUrl = writable<string | null>(null);	
	const showTrailer = writable(false);
	const apiKey = import.meta.env.VITE_TMDB_API_KEY;

	async function fetchTmdbId(imdbId: string): Promise<string | null> {
		try {
			const response = await fetch(
				`https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`
			);
			const data = await response.json();
			if (data.movie_results && data.movie_results.length > 0) {
				return data.movie_results[0].id.toString();
			}
		} catch (error) {
			console.error('Error fetching TMDB ID:', error);
		}
		return null;
	}

	async function fetchTrailer() {
		if (!$trailerUrl) {
      
			const tmdbId = await fetchTmdbId(movie.imdbID as string);
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
		showTrailer.set(true);
	}

	function closeTrailer() {
		showTrailer.set(false);
	}
</script>

<img
class="poster"
src="{movie.poster}"
alt={movie.title}
/>

{#if movie}
<div class="details">
<h1>{movie?.title ?? $page.params.id}</h1>
<p>{movie.description}</p>
<p><strong>Erscheinungsdatum:</strong> {movie.year}</p>
<button class="trailer-button" onclick={fetchTrailer}>Trailer ansehen</button>
</div>
<div class="showtimes">
{#each shows as show}
  <div class="showtime">
	<p><strong>{show.date}</strong></p>
	<p>{show.time}</p>
	<button
	  onclick={() => goto(`/film/${movie.id}/showing/${show.id}/`)}
	  >
	  Zur Buchung →</button>
  </div>
{/each}
</div>
{:else}
<p>Der Film wurde nicht gefunden.</p>
{/if}

{#if $showTrailer}
	<TrailerPopup url={$trailerUrl ?? ''} on:close={closeTrailer} />
{/if}

<style>
	/* ... Ihre bestehenden Styles ... */
	.trailer-button {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background: #f00;
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	.container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .poster {
      max-width: 100%;
      border-radius: 8px;
    }
    .details {
      margin: 1rem 0;
    }
    .showtimes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .showtime {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      text-align: center;
      background: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .showtime button {
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      background: #000;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
</style>
