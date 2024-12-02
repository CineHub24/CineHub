<script lang="ts">
	export let data;
	//   export let form;
	const movies:{id: string; title: string; genre: string; director: string, poster:string, short:string} = [];
	const {movies} = data
</script>

<form method="POST" action="?/search">
	<input name="query" type="text" placeholder="Enter Film-Name" />
	<button>Log in</button>
</form>

{#if movies}
	
{/if}