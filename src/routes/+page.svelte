<script lang="ts">
	import Header from '../lib/components/header.svelte';
	import MovieCard from '../lib/components/movie_card.svelte';
	import Footer from '../lib/components/footer.svelte';
	import { enhance } from '$app/forms';
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import type { PageServerData } from './$types';
    
	function switchToLanguage(newLanguage: AvailableLanguageTag) {
		const canonicalPath = i18n.route($page.url.pathname);
		const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
		goto(localisedPath);
	}

	function handleLogin() {
		goto('/login');
	}

	function goToProfile() {
		goto('/profile');
	}
    
	const {data}:{data:PageServerData} = $props();
	const { movies, user } = data;
</script>

<style>
	.movies-container {
		padding: 20px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
	}
</style>

<Header 
	user={{ email: user?.email || 'Guest' }}
	onLoginClick={handleLogin}
	onProfileClick={goToProfile}
	onLanguageSwitch={() => switchToLanguage("en")} 
/>

<div class="movies-container">
	{#each movies as movie}
		<MovieCard movie = {movie} url= "film/{movie.id}" />
	{/each}
</div>


<Footer />