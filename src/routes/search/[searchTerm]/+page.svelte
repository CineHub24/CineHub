<script>
	import { page } from '$app/stores';
	import MovieCard from '$lib/components/movie_card.svelte';

	export let data;

	let sortOption = 'title';

	// Sortierfunktionen
	const sortFunctions = {
		title: (a, b) => a.title.localeCompare(b.title),
		year: (a, b) => b.year.localeCompare(a.year),
		runtime: (a, b) => b.runtime - a.runtime,
		rating: (a, b) => b.ageRating.localeCompare(a.ageRating)
	};

	// Sortiere Ergebnisse
	$: sortedResults = [...data.films].sort(sortFunctions[sortOption]);
</script>

<div class="mx-auto max-w-7xl px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold">Suchergebnisse für "{data.searchTerm}"</h1>

	<!-- Sortieroptionen -->
	<div class="mb-6">
		<label for="sort" class="mr-2">Sortieren nach:</label>
		<select id="sort" bind:value={sortOption} class="rounded-md border p-2 w-40">
			<option value="title">Titel</option>
			<option value="year">Jahr</option>
			<option value="runtime">Laufzeit</option>
			<option value="rating">Altersfreigabe</option>
		</select>
	</div>

	<!-- Suchergebnisse -->
	{#if data.films.length === 0}
		<div class="py-8 text-center">Keine Filme gefunden.</div>
	{:else}
		<div class="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-5">
			{#each sortedResults as film}
				<MovieCard movie={film} url="film/{film.id}" />
			{/each}
		</div>
	{/if}
</div>
