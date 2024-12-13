<script>
	export let data;

	const { priceSets } = data;
</script>

<h1>Alle Preissets</h1>

<ul>
	{#each priceSets as priceSet}
		<li>
			{priceSet.name}

			<button
				on:click={() => {
					/* Hier navigierst du zur Bearbeitungsseite */
				}}>Bearbeiten</button
			>
		</li>
	{/each}
</ul>
