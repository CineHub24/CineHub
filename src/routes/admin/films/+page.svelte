<script lang="ts">
	import MovieCard from "$lib/components/movie_card.svelte";


	import { languageAwareGoto } from "$lib/utils/languageAware";

    const { data } = $props();
    const { movies } = data;

</script>
<div class="bg-white p-6 rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-4">Filmverwaltung</h1>
    <div class="flex justify-end mb-4">
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onclick={() => {
            languageAwareGoto('/admin/film/create');
        }}>
            Neuer Film
        </button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each movies as movie}
            <MovieCard {movie} url="/admin/film/{movie.id}" />
        {/each}
    </div>
</div>