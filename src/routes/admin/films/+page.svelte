<script lang="ts">
	import MovieCardAdmin from '$lib/components/movie_card_admin.svelte';
	import { languageAwareGoto } from '$lib/utils/languageAware';
	import MovieCard from '$lib/components/movie_card_admin.svelte';
	import * as m from '$lib/paraglide/messages.js';

	const { data } = $props();
	const { movies } = data;
</script>

<div class="rounded-lg bg-white p-6 shadow">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-2xl font-bold">{m.movie_management({})}</h1>
		<button
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			onclick={() => languageAwareGoto('/admin/film/create')}
		>
			{m.new_movie({})}
		</button>
	</div>
	<div class="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-5">
		{#each movies as movie}
			<MovieCardAdmin {movie} url="/admin/film/{movie.id}" />
		{/each}
	</div>
</div>
