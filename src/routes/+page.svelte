<script lang="ts">
	import MovieCard from '../lib/components/movie_card.svelte';
	import type { PageServerData } from './$types';

    
	const {data}:{data:PageServerData} = $props();
	const { movies } = data;
</script>

<style>
	.movies-container {
		padding: 20px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
	}
</style>


<div class="movies-container">
	{#each movies as movie}
		<MovieCard movie = {movie} url= "film/{movie.id}" />
	{/each}
</div>
