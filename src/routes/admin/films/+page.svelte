<script lang="ts">
	import MovieCard from '$lib/components/movie_card.svelte';
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';

	export let data;
	const { filme } = data;

	function switchToLanguage(newLanguage: AvailableLanguageTag) {
		const canonicalPath = i18n.route($page.url.pathname);
		const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
		goto(localisedPath);
	}

	function onAddFilmClick() {
		goto('/admin/film/create');
	}

	function onAddRoomClick() {
		goto('/admin/room/create');
	}
</script>

<div class="container">
	<h1>Filme</h1>
	<div class="film-liste">
		{#each filme as movie}
			<div class="movies-container">
				<MovieCard {movie} url="/admin/film/{movie.id}" />
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}
	.film-liste {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.film-item {
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 5px;
	}
	a {
		text-decoration: none;
		color: #333;
	}
</style>
