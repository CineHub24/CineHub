<script lang="ts">
	let { movie, url } = $props();
</script>

<a href={url}>
	<div class="movie-card">
		<img src={movie.poster} alt="{movie.title} Poster" />
		<div class="details">
			<h3 class="title">{movie.title}</h3>
			<!-- <p class="description">{movie.description}</p> -->
		</div>
	</div>
</a>

<style>
	.movie-card {
		background-color: #f5f5f5;
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
		height: 320px;
		width: 175px;
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
		font-size: 1rem;
		margin: 0 0 10px;
		text-align: center;
		white-space: nowrap; /* Prevent text wrapping */
		overflow: hidden; /* Hide overflowing text */
		text-overflow: ellipsis; /* Add "..." for overflow */
	}
	.movie-card .description {
		font-size: 0.9rem;
		color: #555;
	}
</style>
