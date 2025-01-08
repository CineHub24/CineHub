<script lang="ts">
	import {
		LayoutDashboard,
		Film,
		CalendarCheck,
		DollarSign,
		Building,
		Columns,
		ChevronRight,
		ChevronLeft,
		Logs
	} from 'lucide-svelte';
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages.js';

	export let isMenuExpanded = false;
	let isMouseOverSidebar = false;

	const sections = [
		{ id: 'dashboard', icon: LayoutDashboard, label: m.dashboard({}), path: '/admin' },
		{ id: 'movies', icon: Film, label: m.movies({}), path: '/admin/films' },
		{ id: 'pricing', icon: DollarSign, label: m.pricing({}), path: '/admin/pricing' },
		{ id: 'cinemas', icon: Building, label: m.cinemas({}), path: '/admin/cinemas' },
		{ id: 'halls', icon: Columns, label: m.halls({}), path: '/admin/rooms' },
		{ id: 'logs', icon: Logs, label: m.system_logs({}), path: '/admin/logs' }
	];
	$: currentPath = $page.url.pathname;

	function isActive(sectionPath: string) {
		if (sectionPath === '/admin') {
			return currentPath === '/admin' || currentPath === '/de/admin' || currentPath === '/en/admin';
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
	relative overflow-hidden
	bg-white shadow-md
	transition-all
	duration-300
	min-h-[92vh]
	"
	on:mouseenter={handleMouseEnterSidebar}
	on:mouseleave={handleMouseLeaveSidebar}
>
	<div class="flex items-center justify-between border-b p-5 text-center text-xl font-bold">
		{#if isMenuExpanded}
			<span>{m.cinema_admin({})}</span>
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
