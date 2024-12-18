<script lang="ts">

    const { data } = $props();
    const { cinemas } = data;

</script>


<div class="bg-white p-6 rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-4">Kino-Verwaltung</h1>
    <div class="flex justify-end mb-4">
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onclick={() => {
            languageAwareGoto('/admin/cinema/create');
        }}>
            Neues Kino
        </button>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full bg-white border">
            <thead class="bg-gray-100">
                <tr>
                    <th class="p-3 text-left">Name</th>
                    <th class="p-3 text-left">Adresse</th>
                    <th class="p-3 text-left">Öffnet um</th>
                    <th class="p-3 text-left">Schließt um</th>
                    <th class="p-3 text-left">Aktionen</th>
                </tr>
            </thead>
            <tbody>
                {#each cinemas as cinema }
                <tr class="border-b">
                    <td class="p-3">{cinema.name}</td>
                    <td class="p-3"> {cinema.address}</td>
                    <td class="p-3"></td>
                    <td class="p-3"></td>
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