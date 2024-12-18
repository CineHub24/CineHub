<script>
	import { languageAwareGoto } from '$lib/utils/languageAware';
	import { LayoutDashboard, Film, CalendarCheck, DollarSign, Building, Columns, ChevronRight, ChevronLeft } from 'lucide-svelte';

	let activeSection = $state('dashboard');
	let isMenuExpanded = $state(false);
	let isMouseOverSidebar = false;

	let { data } = $props();
	let { movies, showing, halls } = data;
	const sections = [
		{ 
			id: 'dashboard', 
			icon: LayoutDashboard, 
			label: 'Dashboard' 
		},
		{ 
			id: 'movies', 
			icon: Film, 
			label: 'Filme' 
		},
		{ 
			id: 'shows', 
			icon: CalendarCheck, 
			label: 'Shows' 
		},
		{ 
			id: 'pricing', 
			icon: DollarSign, 
			label: 'Preissets' 
		},
		{ 
			id: 'cinemas', 
			icon: Building, 
			label: 'Kinos' 
    },
		{ 
			id: 'halls', 
			icon: Columns, 
			label: 'Kinosäle' 
		}
	];

	function handleMouseLeaveContainer() {
		// Nur zuklappen, wenn Maus nicht über Sidebar
		if (!isMouseOverSidebar) {
			isMenuExpanded = false;
		}
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
	class="flex h-screen bg-gray-100"
	onmouseleave={handleMouseLeaveContainer}
>
	<!-- Sidebar -->
	<div 
		class="
			{isMenuExpanded ? 'w-64' : 'w-16'} 
			bg-white shadow-md 
			transition-all duration-300 
			overflow-hidden 
			relative
		"
		onmouseenter={handleMouseEnterSidebar}
		onmouseleave={handleMouseLeaveSidebar}
	>
		<div class="p-5 border-b text-center font-bold text-xl flex justify-between items-center">
			{#if isMenuExpanded}
				<span>Kino-Admin</span>
			{/if}
			<button 
				onclick={toggleMenu}
				class="ml-auto"
			>
				{#if isMenuExpanded}
					<ChevronLeft />
				{:else}
					<ChevronRight />
				{/if}
			</button>
		</div>
		<nav class="py-4">
			{#each sections as section}
				<button
					onclick={() => activeSection = section.id}
					title={section.label}
					class="
						flex items-center w-full p-3 hover:bg-gray-100 transition
						{activeSection === section.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
						{isMenuExpanded ? 'justify-start' : 'justify-center'}
					"
				>
					<svelte:component this={section.icon} />
					{#if isMenuExpanded}
						<span class="ml-3">{section.label}</span>
					{/if}
				</button>
			{/each}
		</nav>
	</div>

	<!-- Main Content Area -->
	<div class="flex-1 p-10 overflow-y-auto">
		{#if activeSection === 'dashboard'}
			<div class="bg-white p-6 rounded-lg shadow">
				<h1 class="text-2xl font-bold mb-4">Dashboard</h1>
				<div class="grid grid-cols-4 gap-4">
					<div class="bg-blue-100 p-4 rounded">Filme Gesamt: 42</div>
					<div class="bg-green-100 p-4 rounded">Shows diese Woche: 158</div>
					<div class="bg-yellow-100 p-4 rounded">Umsatz: €12.456</div>
					<div class="bg-red-100 p-4 rounded">Freie Plätze: 1.234</div>
				</div>
			</div>
		{:else if activeSection === 'movies'}
			<div class="bg-white p-6 rounded-lg shadow">
				<h1 class="text-2xl font-bold mb-4">Filmverwaltung</h1>
				<div class="flex justify-end mb-4">
					<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
						Neuer Film
					</button>
				</div>
			</div>
		{:else if activeSection === 'shows'}
			<div class="bg-white p-6 rounded-lg shadow">
				<h1 class="text-2xl font-bold mb-4">Show-Verwaltung</h1>
				<div class="flex justify-end mb-4">
					<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
						Neue Show
					</button>
				</div>
			</div>
		{:else if activeSection === 'pricing'}
			<div class="bg-white p-6 rounded-lg shadow">
				<h1 class="text-2xl font-bold mb-4">Preissets</h1>
				<div class="flex justify-end mb-4">
					<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
						Neues Preisset
					</button>
				</div>
			</div>
		{:else if activeSection === 'cinemas'}
			<div class="bg-white p-6 rounded-lg shadow">
				<h1 class="text-2xl font-bold mb-4">Kino-Verwaltung</h1>
				<div class="flex justify-end mb-4">
					<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
						Neues Kino
					</button>
				</div>
			</div>
		{:else if activeSection === 'halls'}
			<div class="bg-white p-6 rounded-lg shadow">
				<h1 class="text-2xl font-bold mb-4">Kinosaal-Verwaltung</h1>
				<div class="flex justify-end mb-4">
					<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onclick={() => {
						console.log('clicked');
						languageAwareGoto('admin/room/create');
					}}>
						Neuer Kinosaal
					</button>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full bg-white border">
						<thead class="bg-gray-100">
							<tr>
								<th class="p-3 text-left">Name</th>
								<th class="p-3 text-left">Kino</th>
								<th class="p-3 text-left">Sitzplätze</th>
								<th class="p-3 text-left">Reihen</th>
								<th class="p-3 text-left">Aktionen</th>
							</tr>
						</thead>
						<tbody>
							{#each halls as hall }
							<tr class="border-b">
								<td class="p-3">{hall.cinemaHall.hallNumber}</td>
								<td class="p-3">{hall.Cinema.name}</td>
								<td class="p-3">180</td>
								<td class="p-3">12</td>
								<td class="p-3">
									<div class="flex space-x-2">
										<button class="text-blue-500 hover:text-blue-700" onclick={()=>{
											languageAwareGoto(`admin/halls/${hall.cinemaHall.id}`);
										}}>Bearbeiten</button>
										<button class="text-red-500 hover:text-red-700">Löschen</button>
									</div>
								</td>
							</tr>
							{/each}												
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
</div>