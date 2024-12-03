<script lang="ts">

	export let data;
	
	let render:boolean = false;
	//   export let form;
	
		
	
	console.log( "client:" + data.movies)
	const {movies} = data
</script>
<form method="POST" action="?/search">
	<input name="query" type="text" placeholder="Enter Film-Name" />
	<button>Search</button>
</form>
<form action="">
	<input type="text" name="description" id="">
</form>





<div>
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
  </div>


