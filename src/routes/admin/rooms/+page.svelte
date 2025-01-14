<!-- src/routes/rooms/+page.svelte -->

<script lang="ts">
    import { enhance } from '$app/forms';
    import { fade } from 'svelte/transition';
    import type { PageData, Actions } from './$types';
    import { goto, invalidateAll } from '$app/navigation';

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
        goto(`/admin/rooms/${roomId}`);
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Rooms</h1>

    <!-- Cinema Filter Dropdown -->
    <div class="mb-6">
        <label for="cinema-filter" class="block text-sm font-medium mb-2">Filter by Cinema:</label>
        <select
            id="cinema-filter"
            on:change={handleCinemaChange}
            class="w-full p-2 border rounded-md"
            bind:value={data.selectedCinemaId }
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
                    <li class="p-4 border rounded-lg bg-white shadow flex justify-between items-center">
                        <div>
                            <h2 class="text-lg font-semibold">{hall.name}</h2>
                            <p class="text-gray-600">Capacity: {hall.capacity}</p>
                        </div>
                        <div class="flex space-x-2">
                            <!-- Edit Button (Future Implementation) -->
                            <button
                                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                on:click={() => {
                                    handleEdit(hall.id)
                                }}
                            >
                                Edit
                            </button>

                            <!-- Delete Form -->
                            <form method="POST" action="?/deleteCinemaHall" use:enhance>
                                <input type="hidden" name="hallId" value={hall.id} />
                                <button
                                    type="submit"
                                    class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            on:click={() => {
                goto('/admin/rooms/create');
            }}
        >
            Add Room
        </button>
    </div>

    <!-- Success and Error Messages -->
    {#if form?.success}
        <div class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {form.message}
        </div>
    {/if}

    {#if form?.error}
        <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {form.error}
        </div>
    {/if}
</div>
