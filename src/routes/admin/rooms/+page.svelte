<!-- src/routes/rooms/+page.svelte -->

<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import type { PageData, Actions } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { languageAwareGoto } from '$lib/utils/languageAware';

	export let data: PageData;
	export let form: { success?: boolean; message?: string; error?: string } | null = null;
	let selectedCinemaId: number | null = data.selectedCinemaId || null;

	// Function to handle cinema selection change
	function handleCinemaChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const selectedCinemaId = select.value;
		// Navigate to the same page with the selected cinemaId as a query parameter
		// This triggers the load function to fetch filtered data
		const url = new URL(window.location.href);
		if (selectedCinemaId) {
			url.searchParams.set('cinemaId', selectedCinemaId);
		} else {
			url.searchParams.delete('cinemaId');
		}
		window.location.href = url.toString();
	}

	// Optional: Function to confirm deletion
	function confirmDeletion(hallName: string): boolean {
		return confirm(`Are you sure you want to delete "${hallName}"?`);
	}

	function handleEdit(roomId: number) {
		languageAwareGoto(`/admin/rooms/${roomId}`);
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-2xl font-bold">Rooms</h1>

	<!-- Cinema Filter Dropdown -->
	<div class="mb-6">
		<label for="cinema-filter" class="mb-2 block text-sm font-medium">Filter by Cinema:</label>
		<select
			id="cinema-filter"
			on:change={handleCinemaChange}
			class="w-full rounded-md border p-2"
			bind:value={data.selectedCinemaId}
		>
			<option value="">All Cinemas</option>
			{#each data.cinemas as cinemaItem}
				<option value={cinemaItem.id}>{cinemaItem.name}</option>
			{/each}
		</select>
	</div>

	<!-- Rooms List -->
	<div>
		{#if data.cinemaHalls.length === 0}
			<p class="text-gray-600">No cinema halls available for the selected cinema.</p>
		{:else}
			<ul class="space-y-4">
				{#each data.cinemaHalls as hall}
					<li class="flex items-center justify-between rounded-lg border bg-white p-4 shadow">
						<div>
							<h2 class="text-lg font-semibold">{hall.name}</h2>
							<p class="text-gray-600">Capacity: {hall.capacity}</p>
						</div>
						<div class="flex space-x-2">
							<!-- Edit Button (Future Implementation) -->
							<button
								class="rounded bg-blue-500 px-3 py-1 text-white transition-colors hover:bg-blue-600"
								on:click={() => {
									handleEdit(hall.id);
								}}
							>
								Edit
							</button>

							<!-- Delete Form -->
							<form method="POST" action="?/deleteCinemaHall" use:enhance>
								<input type="hidden" name="hallId" value={hall.id} />
								<button
									type="submit"
									class="rounded bg-red-500 px-3 py-1 text-white transition-colors hover:bg-red-600"
									on:click={(e) => {
										const confirmed = confirmDeletion(hall.name);
										if (!confirmed) {
											e.preventDefault();
										}
									}}
								>
									Delete
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Add Room Button (Future Implementation) -->
	<div class="mt-6">
		<button
			class="rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
			on:click={() => {
				languageAwareGoto('/admin/rooms/create');
			}}
		>
			Add Room
		</button>
	</div>

	<!-- Success and Error Messages -->
	{#if form?.success}
		<div class="mt-4 rounded border border-green-400 bg-green-100 p-4 text-green-700">
			{form.message}
		</div>
	{/if}

	{#if form?.error}
		<div class="mt-4 rounded border border-red-400 bg-red-100 p-4 text-red-700">
			{form.error}
		</div>
	{/if}
</div>
