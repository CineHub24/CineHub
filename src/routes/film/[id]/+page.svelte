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

<div class="container">
	<!-- ... Ihr bestehendes Template ... -->

	{#if movie}
		<div class="details">
			<h1>{movie?.title ?? $page.params.id}</h1>
			<p>{movie.description}</p>
			<p><strong>Erscheinungsdatum:</strong> {movie.year}</p>
			<button class="trailer-button" onclick={fetchTrailer}>Trailer ansehen</button>
		</div>
		<!-- ... Rest Ihres Templates ... -->
	{/if}
</div>

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
</style>
