<script lang="ts">
	import type { Movie, CompleteMovieInformation } from './+page.server';
    import { enhance } from '$app/forms';
	import { ConsoleLogWriter } from 'drizzle-orm';
    
    const props = $props();
    
    let movies: Movie[] = $state([]);
    let fullMovieDetails:  CompleteMovieInformation | undefined = $state();
    // let selectedMovie : Movie | undefined = $state();
    let isLoading = $state(false);

async function getSelectedMovie(movie: Movie): Promise<CompleteMovieInformation | undefined> {
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
            return fullMovieDetailsData;
        }

        return undefined;
    } catch (error) {
        console.error('Error fetching full movie details:', error);
        return undefined;
    }
}
</script>

<form method="POST" action="?/search" use:enhance={() => {
    isLoading = true;
    return async ({ result, update }) => {
        if (result.type === 'success' && result.data?.movies) {
            movies = result.data.movies as Movie[];
        }
        isLoading = false;
        await update();
    };
}}>
    <input type="text" name="query" />
    <button type="submit">Search</button>
</form>

{#if isLoading}
	<p>Loading...</p>
{:else if movies.length > 0}
	{#each movies as movie}
		<div>
			<h3>{movie.title}</h3>
			<p>Year: {movie.year}</p>
            <button type="submit" onclick={
                async () =>  {
                     console.log(movie);
                     fullMovieDetails = await getSelectedMovie(movie);
                     console.log(fullMovieDetails)
                 }
             }>select</button>
		</div>
	{/each}
{:else}
	<p>No movies found.</p>
{/if}

{#if fullMovieDetails != undefined}
<form method="POST" action="?/save">
    <label for="year">Year:</label>
    <input type="text" id="year" name="year" value={fullMovieDetails.year}/>

    <label for="title">Title:</label>
    <input type="text" id="title" name="title" value={fullMovieDetails.title} />

    <label for="id">id:</label>
    <input type="text" id="id" name="imdbID" value={fullMovieDetails.imdbID}/>

    <input type="hidden" id="genres" name="genres" value={fullMovieDetails.genre} />
    <input type="hidden" id="plot" name="plot" value={fullMovieDetails.description} />
    <input type="hidden" id="poster" name="poster" value={fullMovieDetails.poster} />
    <input type="hidden" id="director" name="director" value={fullMovieDetails.director} />
    <input type="hidden" id="ageRating" name="actors" value={fullMovieDetails.ageRating} />
    <input type="hidden" id="runtime" name="runtime" value={fullMovieDetails.runtime} />

    <button type="submit">Save</button>
</form>
{:else}
	<p>No Movie Preset Selected</p>
{/if}


