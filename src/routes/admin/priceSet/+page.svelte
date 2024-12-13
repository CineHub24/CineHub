<script>
    export let data;
    const {priceSets} = data
</script>

<div class="container mx-auto px-4">
<h1 class="text-3xl font-bold mb-4">Alle Preissets</h1>
<ul class="divide-y divide-gray-200">
    {#each priceSets as priceSet}
    <li class="py-4 flex justify-between">
        <span>{priceSet.name}</span>
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Bearbeiten
        </button>
    </li>
    {/each}
</ul>
</div>