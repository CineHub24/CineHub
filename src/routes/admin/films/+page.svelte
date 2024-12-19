<script lang="ts">
	import MovieCard from "$lib/components/movie_card.svelte";


	import { languageAwareGoto } from "$lib/utils/languageAware";

    const { data } = $props();
    const { movies } = data;

</script>
<div class="bg-white p-6 rounded-lg shadow">
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold">Filmverwaltung</h1>
        <button 
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
            onclick={() => languageAwareGoto('/admin/film/create')}
        >
            Neuer Film
        </button>
    </div>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-5">
        {#each movies as movie}
            <MovieCard {movie} url="/admin/film/{movie.id}" />
        {/each}
    </div>
</div>