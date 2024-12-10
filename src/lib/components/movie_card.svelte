<script lang="ts">
	export let movie: {
		id: number;
		title: string;
		description: string;
		poster: string;
	};

	import { goto } from '$app/navigation';

	// Navigation logic
	function navigateToMovie() {
		goto(`/film/${movie.id}`);
	}
</script>

<style>
	.movie-card {
		background-color: #f5f5f5;
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
	}
	.movie-card:hover {
		transform: translateY(-5px);
	}
	.movie-card img {
		width: 100%;
		height: auto;
	}
	.movie-card .details {
		padding: 15px;
	}
	.movie-card .title {
		font-size: 1.2rem;
		margin: 0 0 10px;
	}
	.movie-card .description {
		font-size: 0.9rem;
		color: #555;
	}
</style>

<div 
	class="movie-card"
	tabindex="0"
	role="button"
	onclick={navigateToMovie}
	onkeydown={(e) => e.key === 'Enter' && navigateToMovie()}
>
	<img src={movie.poster} alt="{movie.title} Poster">
	<div class="details">
		<h3 class="title">{movie.title}</h3>
		<p class="description">{movie.description}</p>
	</div>
</div>
