<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { page } from '$app/stores';
	import Header from '$lib/components/header.svelte';
	import Footer from '$lib/components/footer.svelte';
	import '../app.css';
	let { children } = $props();

	import { derived } from 'svelte/store';

	const noFooterPages = derived(page, ($page) => {
		const authPages = ['/cart', '/admin', '/login', '/register']; // Liste der Seiten ohne Footer
		// Checke auch Teilstrings wie "/cart/"
		return authPages.some((route) => $page.route.id?.startsWith(route));
	});

	const noHeaderPages = derived(page, ($page) => {
		const authPages = ['/login', '/register']; // Liste der Seiten ohne Footer
		// Checke auch Teilstrings wie "/cart/"
		return authPages.some((route) => $page.route.id?.startsWith(route));
	});
</script>

<ParaglideJS {i18n}>
	{#if !$noHeaderPages}
		<Header />
	{/if}

	<main>
		<!-- Render die Kinder-Komponenten -->
		{@render children()}
	</main>

	<!-- Footer wird nur angezeigt, wenn er nicht in der Liste der authPages ist -->
	{#if !$noFooterPages}
		<Footer />
	{/if}
</ParaglideJS>
