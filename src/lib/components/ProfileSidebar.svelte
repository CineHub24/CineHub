<script lang="ts">
	import { TicketCheck, UserRoundPen, Film, ChevronRight, ChevronLeft } from 'lucide-svelte';
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages.js';

	export let isMenuExpanded = false;
	let isMouseOverSidebar = false;

	const sections = [
		{ id: 'profile', icon: UserRoundPen, label: m.profile_data({}), path: '/profile' },
		{ id: 'tickets', icon: TicketCheck, label: m.tickets({}), path: '/profile/tickets' },
		{ id: 'bookings', icon: Film, label: m.bookings({}), path: '/profile/bookings' }
	];
	$: currentPath = $page.url.pathname;

	function isActive(sectionPath: string) {
		if (sectionPath === '/profile') {
			return (
				currentPath === '/profile' || currentPath === '/de/profile' || currentPath === '/en/profile'
			);
		}
		return (
			currentPath.startsWith(sectionPath) ||
			currentPath.startsWith('/de' + sectionPath) ||
			currentPath.startsWith('/en' + sectionPath)
		);
	}

	function handleMouseEnterSidebar() {
		isMouseOverSidebar = true;
		isMenuExpanded = true;
	}

	function handleMouseLeaveSidebar() {
		isMouseOverSidebar = false;
		isMenuExpanded = false;
	}

	function toggleMenu() {
		isMenuExpanded = !isMenuExpanded;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="
	{isMenuExpanded ? 'w-64' : 'w-16'}
	relative min-h-[92vh]
	overflow-hidden bg-white
	shadow-md
	transition-all
	duration-300
	"
	on:mouseenter={handleMouseEnterSidebar}
	on:mouseleave={handleMouseLeaveSidebar}
>
	<div class="flex items-center justify-between border-b p-5 text-center text-xl font-bold">
		{#if isMenuExpanded}
			<span>{'Profile'}</span>
		{/if}
		<button on:click={toggleMenu} class="ml-auto">
			{#if isMenuExpanded}
				<ChevronLeft />
			{:else}
				<ChevronRight />
			{/if}
		</button>
	</div>
	<nav class="py-4">
		{#each sections as section}
			<a
				href={section.path}
				title={section.label}
				class="
	flex w-full items-center p-3 transition hover:bg-gray-100
	{isActive(section.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
	{isMenuExpanded ? 'justify-start' : 'justify-center'}
	"
			>
				<svelte:component this={section.icon} />
				{#if isMenuExpanded}
					<span class="ml-3">{section.label}</span>
				{/if}
			</a>
		{/each}
	</nav>
</div>
