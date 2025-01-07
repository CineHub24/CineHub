<script>
	import { page } from '$app/stores';
	import MovieCard from '$lib/components/movie_card.svelte';
	import * as m from '$lib/paraglide/messages.js';

	export let data;

	let sortOption = 'title';

	const sortFunctions = {
		title: (a, b) => a.title.localeCompare(b.title),
		year: (a, b) => b.year.localeCompare(a.year),
		runtime: (a, b) => b.runtime - a.runtime,
		rating: (a, b) => b.ageRating.localeCompare(a.ageRating)
	};

	$: sortedResults = [...data.films].sort(sortFunctions[sortOption]);
</script>

<div class="mx-auto max-w-7xl px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold">{m.search_results_for({})}: "{data.searchTerm}"</h1>

	<div class="mb-6">
		<label for="sort" class="mr-2">{m.sort_by({})}</label>
		<select id="sort" bind:value={sortOption} class="w-40 rounded-md border p-2">
			<option value="title">{m.title({})}</option>
			<option value="year">{m.year({})}</option>
			<option value="runtime">{m.runtime({})}</option>
			<option value="rating">{m.age_rating({})}</option>
		</select>
	</div>

	{#if data.films.length === 0}
		<div class="py-8 text-center">{m.no_films_found({})}</div>
	{:else}
		<div class="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-5">
			{#each sortedResults as film}
				<MovieCard movie={film} url="film/{film.id}" />
			{/each}
		</div>
	{/if}
</div>
