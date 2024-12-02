<script lang="ts">
	export let data;
	//   export let form;
	const {movies} = data
</script>

<form method="POST" action="?/search">
	<input name="query" type="text" placeholder="Enter Film-Name" />
	<button>Log in</button>
</form>

{#if movies}

{#each movies as movie}
	<!-- <h1>{movies.title}</h1> Muss angepasst werden -->
{/each}

{/if}


