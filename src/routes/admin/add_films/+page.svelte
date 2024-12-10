<script lang="ts">
	import type { Movie, CompleteMovieInformation } from './+page.server';
    import { enhance } from '$app/forms';
	import { ConsoleLogWriter } from 'drizzle-orm';
    
    const props = $props();
    
    let movies: Movie[] = $state([]);
    let fullMovieDetails: CompleteMovieInformation | null = $state(null);
    let isLoading = $state(false);
    let errorMessage = $state('');

    async function setSelectedMovie(movie: Movie) {
    const formData = new FormData();
    formData.append('id', movie.imdbID.toString());

    try {
        const response = await fetch('?/fetchFullMovieDetails', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.type === 'success') {
            const data = result.data;
            const fullMovieDetailsData = JSON.parse(JSON.parse(data)[3]);
            console.log(fullMovieDetailsData?.imdbID);
            fullMovieDetails = fullMovieDetailsData;
        }

    } catch (error) {
        console.error('Error fetching full movie details:', error);
        errorMessage = 'Error fetching full movie details';
    }
}
</script>

<form method="POST" action="?/save">
    <label for="year">Year:</label>
    <input type="text" id="year" name="year" value={fullMovieDetails != null ? fullMovieDetails.year : ""}/>

    <label for="title">Title:</label>
    <input type="text" id="title" name="title" value={fullMovieDetails != null ? fullMovieDetails.title : ""} />

    <label for="id">id:</label>
    <input type="text" id="id" name="imdbID" value={fullMovieDetails != null ? fullMovieDetails.imdbID : ""}/>

    <input type="hidden" id="genres" name="genres" value={fullMovieDetails != null ? fullMovieDetails.genre : ""} />
    <input type="hidden" id="plot" name="plot" value={fullMovieDetails != null ? fullMovieDetails.description : ""} />
    <input type="hidden" id="poster" name="poster" value={fullMovieDetails != null ? fullMovieDetails.poster : ""} />
    <input type="hidden" id="director" name="director" value={fullMovieDetails != null ? fullMovieDetails.director: "" } />
    <input type="hidden" id="ageRating" name="actors" value={fullMovieDetails != null ? fullMovieDetails.ageRating: ""} />
    <input type="hidden" id="runtime" name="runtime" value={fullMovieDetails != null ? fullMovieDetails.runtime: ""} />

    <button type="submit">Save</button>
</form>

<form method="POST" action="?/search" use:enhance={() => {
    isLoading = true;
    errorMessage = '';

    return async ({ result, update }) => {
        try {
            if (result.type === 'success' && result.data?.movies) {
                movies = result.data.movies as Movie[];
            } else {
                errorMessage = 'No movies found';
            }
        } catch (error) {
            errorMessage = 'Error processing search results';
        } finally {
            isLoading = false;
            await update();
        }
    };
}}>
    <input type="text" name="query" />
    <button type="submit">Search</button>
</form>

{#if errorMessage}
    <p class="error">{errorMessage}</p>
{/if}

{#if isLoading}
	<p>Loading...</p>
{:else if movies.length > 0}
	{#each movies as movie}
		<div>
			<h3>{movie.title}</h3>
			<p>Year: {movie.year}</p>
            <button type="submit" onclick={
                 () => setSelectedMovie(movie)
             }>select</button>
		</div>
	{/each}
{:else}
	<p>No movies found.</p>
{/if}






