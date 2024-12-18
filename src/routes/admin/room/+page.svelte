<script lang="ts">

	import { languageAwareGoto } from "$lib/utils/languageAware";
    const { data } = $props();
    const { halls } = data;



</script>
<div class="bg-white p-6 rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-4">Kinosaal-Verwaltung</h1>
    <div class="flex justify-end mb-4">
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onclick={() => {
            languageAwareGoto('/admin/room/create');
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
                    <th class="p-3 text-left">Aktionen</th>
                </tr>
            </thead>
            <tbody>
                {#each halls as hall }
                <tr class="border-b">
                    <td class="p-3">{hall.CinemaHall.id}</td>
                    <td class="p-3"> {hall.Cinema?.name}</td>
                    <td class="p-3">{hall.CinemaHall.capacity}</td>
                    <td class="p-3">
                        <div class="flex space-x-2">
                            <button class="text-blue-500 hover:text-blue-700">Bearbeiten</button>
                            <button class="text-red-500 hover:text-red-700">Löschen</button>
                        </div>
                    </td>
                </tr>
                {/each}													
            </tbody>
        </table>
    </div>
</div>