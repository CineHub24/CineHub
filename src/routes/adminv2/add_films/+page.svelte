<script lang="ts">
	import type { Movie } from './+page.server';
    import { enhance } from '$app/forms';
    
    const props = $props();
    
    let movies: Movie[] = $state([]);
    let isLoading = $state(false);
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
			<form method="POST" action="?/save">
				<input type="hidden" name="id" value={movie.id} />
				<button type="submit">Save Movie</button>
			</form>
		</div>
	{/each}
{:else}
	<p>No movies found.</p>
{/if}