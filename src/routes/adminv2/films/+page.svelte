<script lang="ts">

	export let data;
	let render = false;
	//   export let form;
	
		
	
	console.log( "client:" + data.movies)
	const {movies} = data
</script>
<form method="POST" action="?/search">
	<input name="query" type="text" placeholder="Enter Film-Name" />
	<button>Search</button>
</form>





<div>
	{#each movies as movie}
	  <div class="film">
		<h3>{movie.title}</h3>
		<img src={movie.poster} alt={movie.title} width="200" height="400"/>
		<p><strong>Year:</strong> {movie.year}</p>
		<form>
		<button>Save to Database</button>
	</form>
	</div>
	{/each}
  </div>


