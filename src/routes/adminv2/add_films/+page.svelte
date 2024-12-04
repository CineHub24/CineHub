<script lang="ts">
	let { data, form } = $props();

	let render:boolean = false;
		

	console.log( "client:" + data.movies)
	const { movies } = data
</script>


<form method="POST" action="?/search">
	<input name="query" type="text" placeholder="Enter Film-Name" />
	<button>Search</button>
</form>
<form action="">
	<input type="text" name="description" id="">
</form>
{#await data}
	<h1>Loading...</h1>
	{:then {movies}}
		{#if movies.length === 0}
			<h1>No movies found</h1>
		{:else}
			{#each movies as movie}
				<div class="film">
					<h3>{movie.title}</h3>
					<img src={movie.poster} alt={movie.title} width="200" height="400"/>
					<p><strong>Year:</strong> {movie.year}</p>
					<form method="POST" action="?/save">
						<button name="id" value= {movie.id}>Save to Database</button>
					</form>
				</div>
			{/each}
		{/if}
	{:catch error}
		<h1>{error.message}</h1>
{/await}



