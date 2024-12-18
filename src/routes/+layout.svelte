<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { page } from '$app/stores';
	import Header from '$lib/components/header.svelte';
	import Footer from '$lib/components/footer.svelte';
	import '../app.css';
	let { children } = $props();

	import { derived } from 'svelte/store';

	const isAuthPage = derived(page, ($page) => {
		return $page.route.id === '/login' || $page.route.id === '/register';
	});
</script>

<ParaglideJS {i18n}>
	{#if !$isAuthPage}
		<Header />
	{/if}

	<main>
		{@render children()}
	</main>

	{#if !$isAuthPage}
		<Footer />
	{/if}
</ParaglideJS>
