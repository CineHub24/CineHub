<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;
	const { movies } = data;
    function handleClick() {
    goto('/')
  }
</script>

<h1>Filme</h1>
{#each movies as movie}
	<div onclick={handleClick}>
		<h2>{movie.title}</h2>
		<img src={movie.poster} alt={movie.title} />
		<br/>
	</div>
{/each}
