<script lang="ts">
	import MovieCard from '$lib/components/movie_card.svelte';
import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import { LayoutDashboard, Film, CalendarCheck, DollarSign, Building, Columns, ChevronRight, ChevronLeft } from 'lucide-svelte';

	let activeSection = $state('dashboard');
	let isMenuExpanded = $state(false);
	let isMouseOverSidebar = false;

	let { data } = $props();


</script>

	<!-- Main Content Area -->
	<div class="flex-1 p-10 overflow-y-auto">
		
			<div class="bg-white p-6 rounded-lg shadow">
				<h1 class="text-2xl font-bold mb-4">Dashboard</h1>
				<div class="grid grid-cols-4 gap-4">
					<div class="bg-blue-100 p-4 rounded">Filme Gesamt: 42</div>
					<div class="bg-green-100 p-4 rounded">Shows diese Woche: 158</div>
					<div class="bg-yellow-100 p-4 rounded">Umsatz: €12.456</div>
					<div class="bg-red-100 p-4 rounded">Freie Plätze: 1.234</div>
				</div>
			</div>
		
		
			<!-- <div class="bg-white p-6 rounded-lg shadow">
				<h1 class="text-2xl font-bold mb-4">Preissets</h1>
				<div class="flex justify-end mb-4">
					<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
						Neues Preisset
					</button>
				</div>
			</div>
			 -->
		
		
	</div>
