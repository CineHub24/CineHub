<script lang="ts">
	import type { Movie, CompleteMovieInformation } from './+page.server';
	import { enhance } from '$app/forms';
	import { ConsoleLogWriter } from 'drizzle-orm';
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages.js';

	const props = $props();

	let movies: Movie[] = $state([]);
	let fullMovieDetails: CompleteMovieInformation | null = $state(null);
	let isLoading = $state(false);
	let errorMessage = $state('');

	async function setSelectedMovie(movie: Movie) {
		const formData = new FormData();
		formData.append('id', movie.imdbID?.toString() ?? '');

		try {
			const response = await fetch('?/fetchFullMovieDetails', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			console.log(result);

			if (result.type === 'success') {
				const data = result.data;
				const fullMovieDetailsData = JSON.parse(JSON.parse(data)[3]);
				console.log(fullMovieDetailsData?.imdbID);
				fullMovieDetails = fullMovieDetailsData;
			}
		} catch (error) {
			console.error('Error fetching full movie details:', error);
			errorMessage = m.error_fetching_movie_details({});
		}
	}
</script>

<div class="container">
	<div class="form-container">
		<form
			class="form"
			method="POST"
			action="?/search"
			use:enhance={() => {
				isLoading = true;
				errorMessage = '';

				return async ({ result, update }) => {
					try {
						if (result.type === 'success' && result.data?.movies) {
							movies = result.data.movies as Movie[];
						} else {
							errorMessage = m.no_movies_found({});
						}
					} catch (error) {
						errorMessage = m.error_processing_results({});
					} finally {
						isLoading = false;
						await update();
					}
				};
			}}
		>
			<label for="query">{m.search_movies()}:</label>
			<input type="text" id="query" name="query" />
			<button type="submit">{m.search({})}</button>

			<div class="movies-container">
				{#if movies.length > 0}
					{#each movies as movie}
						<div class="movie">
							<div>
								<h3>{movie.title}</h3>
								<p>{m.year()}: {movie.year}</p>
							</div>
							<button type="button" onclick={() => setSelectedMovie(movie)}>{m.select({})}</button>
						</div>
					{/each}
				{:else}
					<p>{m.no_movies_found({})}</p>
				{/if}
			</div>
		</form>

		<form class="form" method="POST" action="?/save">
			{#if fullMovieDetails?.poster}
				<img
					class="mx-auto h-[20vh] object-contain"
					src={fullMovieDetails?.poster ?? ''}
					alt="Movie Poster"
				/>
			{/if}
			<label for="title">{m.title()}:</label>
			<input
				required
				type="text"
				id="title"
				name="title"
				value={fullMovieDetails != null ? fullMovieDetails.title : ''}
			/>

			<label for="year">{m.year()}:</label>
			<input
				required
				type="text"
				id="year"
				name="year"
				value={fullMovieDetails != null ? fullMovieDetails.year : ''}
			/>

			<label for="director">{m.director()}:</label>
			<input
				type="text"
				id="director"
				name="director"
				value={fullMovieDetails != null ? fullMovieDetails.director : ''}
			/>

			<label for="runtime">{m.runtime()}:</label>
			<input
				type="text"
				id="runtime"
				name="runtime"
				value={fullMovieDetails != null ? fullMovieDetails.runtime : ''}
			/>

			<label for="genres">{m.genres()}:</label>
			<input
				type="text"
				id="genres"
				name="genres"
				value={fullMovieDetails != null ? fullMovieDetails.genre : ''}
			/>

			<input
				type="hidden"
				id="ageRating"
				name="actors"
				value={fullMovieDetails != null ? fullMovieDetails.ageRating : ''}
			/>
			<input
				type="hidden"
				id="poster"
				name="poster"
				value={fullMovieDetails != null ? fullMovieDetails.poster : ''}
			/>
			<input
				type="hidden"
				id="id"
				name="imdbID"
				value={fullMovieDetails != null ? fullMovieDetails.imdbID : ''}
			/>
			<input
				type="hidden"
				id="plot"
				name="plot"
				value={fullMovieDetails != null ? fullMovieDetails.description : ''}
			/>

			<button type="submit">{m.save({})}</button>
		</form>
	</div>

	<!-- {#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}

	{#if isLoading}
		<p>{m.loading({})}</p>
	{/if} -->
</div>

<style>
	/* body {
        display: flex;
        flex-wrap: wrap;
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
    } */

	.container {
		display: flex;
		flex-direction: column;
		gap: 20px;
		width: 100%;
		padding: 20px;
	}

	.form-container {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
	}

	.form {
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 8px;
		background-color: #f9f9f9;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		flex: 1 1 45%;
		min-width: 300px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.form label {
		display: block;
		margin-bottom: 5px;
		font-weight: bold;
	}

	.form input[type='text'] {
		width: 100%;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	.form button {
		margin-top: 20px;
		padding: 10px;
		background-color: #007bff;
		color: #fff;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.form button:hover {
		background-color: #0056b3;
	}

	.movies-container {
		max-height: 400px;
		overflow-y: auto;
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 10px;
		background-color: #f9f9f9;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		margin-top: 20px;
	}

	.movie {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px;
		margin-bottom: 10px;
		border: 1px solid #ccc;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		background-color: #fff;
	}

	.movie h3 {
		margin: 0;
		font-size: 1.2rem;
	}

	.movie p {
		margin: 5px 0;
		font-size: 0.9rem;
		color: #555;
	}

	.movie button {
		padding: 10px;
		border: none;
		background-color: #007bff;
		color: #fff;
		border-radius: 8px;
		height: 100%;
		cursor: pointer;
	}

	.movie button:hover {
		background-color: #0056b3;
	}

	@media (max-width: 768px) {
		.form-container {
			flex-direction: column;
		}

		.form-container form:first-child {
			order: -1;
		}

		.form {
			flex: 1 1 100%;
		}

		.movies-container {
			margin-top: 0;
		}
	}
</style>
