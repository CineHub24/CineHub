<script lang="ts">

	let { movie, url } = $props();
 
	// Funktion, um den Film-Link zu öffnen

	function navigateToUrl() {

		window.location.href = url;

	}
 
	// Funktion, um den Trailer zu öffnen

	function openTrailer(event: Event) {

		event.stopPropagation(); // Verhindert, dass der Klick das `navigateToUrl` auslöst

		if (movie.trailer) {

			window.open(movie.trailer, "_blank");

		}

	}
</script>
 
<div class="movie-card" on:click={navigateToUrl}>
<img src={movie.poster} alt="{movie.title} Poster" />
<div class="overlay">
<h3 class="title">{movie.title}</h3>
<div class="buttons">
<button class="button trailer-button" on:click={openTrailer}>

				Trailer
</button>
<a href={url} class="button tickets-button">Details</a>
</div>
</div>
</div>
 
<style>

	.movie-card {

		position: relative;

		background-color: #f5f5f5;

		border: 1px solid #ddd;

		border-radius: 8px;

		overflow: hidden;

		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

		transition: transform 0.2s;

		height: 290px;

		width: 170px;

		cursor: pointer;

	}

	.movie-card:hover {

		transform: translateY(-5px);

	}

	.movie-card img {

		width: 100%;

		height: 100%;

		object-fit: cover;

	}
 
	/* Overlay für den Hover-Effekt */

	.overlay {

		position: absolute;

		top: 0;

		left: 0;

		width: 100%;

		height: 100%;

		background-color: rgba(0, 0, 0, 0.7); /* Abdunkelung */

		color: white;

		display: flex;

		flex-direction: column;

		justify-content: space-between;

		opacity: 0;

		transition: opacity 0.3s ease-in-out;

		padding: 10px;

	}
 
	.movie-card:hover .overlay {

		opacity: 1;

	}
 
	/* Titel im Overlay */

	.title {

	font-size: 1rem;

	margin-bottom: auto;

	text-align: left; /* Text linksbündig */

	font-weight: bold; /* Fett */

	}
 
	/* Buttons */

	.buttons {

		width: 100%;

		display: flex;

		flex-direction: column;

		gap: 10px;

	}
 
	.button {

		width: 100%; /* Volle Breite minus Padding */

		padding: 10px 0;

		font-size: 0.9rem;

		text-align: center;

		border-radius: 5px;

		text-decoration: none; /* Entfernt Unterstreichung für Links */

		cursor: pointer;

	}
 
	.trailer-button {

		background-color: transparent;

		color: white;

		border: 2px solid white;

	}
 
	.trailer-button:hover {

		background-color: rgba(255, 255, 255, 0.2);

	}
 
	.tickets-button {

		background-color: white;

		color: black;

		border: none;

	}
 
	.tickets-button:hover {

		background-color: #e0e0e0;

	}
</style>
 