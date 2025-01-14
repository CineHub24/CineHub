<script lang="ts">
	let { movie, url } = $props();
	const isAdminMode = url.includes('/admin/');

	function navigateToUrl() {
		window.location.href = url;
	}

	function openTrailer(event: Event) {
		event.stopPropagation();
		if (movie.trailer) {
			window.open(movie.trailer, "_blank");
		}
	}
</script>
{#if isAdminMode}
	<!-- Admin Layout -->
	<div class="movie-card admin">
		<div class="image-container">
			<img src={movie.poster} alt="{movie.title} Poster" />
		</div>
		<div class="admin-content">
			<h3 class="title">{movie.title}</h3>
			<div class="info-grid">
				
				<span class="info-label">Duration:</span>
				<span class="info-value">{movie.runtime} min</span>
				
				<span class="info-label">Director:</span>
				<span class="info-value">{movie.director}</span>

				<span class="info-label">ID:</span>
				<span class="info-value">{movie.id}</span>
			</div>
			
			<div class="admin-buttons">
				{#if movie.trailer}
					<button class="button admin-button" on:click={openTrailer}>
						View Trailer
					</button>
				{/if}
				<a href={url} class="button admin-primary-button">
					Edit Movie
				</a>
			</div>
		</div>
	</div>
{:else}
	<!-- Public Layout (Original) -->
	<div class="movie-card" on:click={navigateToUrl}>
		<img src={movie.poster} alt="{movie.title} Poster" />
		<div class="overlay">
			<h3 class="title">{movie.title}</h3>
			<div class="buttons">
				{#if movie.trailer}
					<button class="button trailer-button" on:click={openTrailer}>
						Trailer
					</button>
				{/if}
				<a href={url} class="button tickets-button">Tickets</a>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Gemeinsame Basis-Styles */
	.movie-card {
		position: relative;
		background-color: #f5f5f5;
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
		width: 220px;
		height: 290px;
		cursor: pointer;
	}

	.movie-card:hover {
		transform: translateY(-5px);
	}

	/* Public Layout Styles */
	.movie-card:not(.admin) {
		height: 320px;
	}

	.movie-card:not(.admin) img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
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

	/* Admin Layout Styles */
	.movie-card.admin {
		cursor: default;
		display: flex;
		flex-direction: column;
		background-color: white;
	}

	.image-container {
		aspect-ratio: 2/3;
		width: 100%;
	}

	.image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.admin-content {
		padding: 1rem;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.info-label {
		color: #666;
		font-weight: 500;
	}

	.info-value {
		color: #1a1a1a;
		text-align: right;
	}

	/* Button Styles */
	.buttons {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.button {
		width: 100%;
		padding: 10px 0;
		font-size: 0.9rem;
		text-align: center;
		border-radius: 5px;
		text-decoration: none;
		cursor: pointer;
	}

	/* Public Buttons */
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

	/* Admin Buttons */
	.admin-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: auto;
	}

	.admin-button {
		background-color: #f1f5f9;
		color: #1e293b;
		border: 1px solid #e2e8f0;
	}

	.admin-button:hover {
		background-color: #e2e8f0;
	}

	.admin-primary-button {
		background-color: #2563eb;
		color: white;
		border: none;
	}

	.admin-primary-button:hover {
		background-color: #1d4ed8;
	}

	/* Title Styles */
	.title {
		font-size: 1rem;
		font-weight: bold;
	}

	.movie-card:not(.admin) .title {
		color: white;
		margin-bottom: auto;
	}

	.movie-card.admin .title {
		color: #1a1a1a;
	}
</style>