<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';

	function switchToLanguage(newLanguage: AvailableLanguageTag) {
		const canonicalPath = i18n.route($page.url.pathname);
		const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
		goto(localisedPath);
	}

	let movies = [
		{ title: 'The Dark Knight', description: 'A superhero film directed by Christopher Nolan.', poster: '/images/dark-knight.jpg' },
		{ title: 'Inception', description: 'A sci-fi thriller directed by Christopher Nolan.', poster: '/images/inception.jpg' },
		{ title: 'Interstellar', description: 'A space exploration drama directed by Christopher Nolan.', poster: '/images/interstellar.jpg' },
		{ title: 'Dune', description: 'A science fiction film directed by Denis Villeneuve.', poster: '/images/dune.jpg' },
		{ title: 'Avatar: The Way of Water', description: 'The sequel to the blockbuster hit Avatar.', poster: '/images/avatar2.jpg' },
	];

	function goToLogin() {
		goto('/login');
	}
</script>

<style>
	body {
		margin: 0;
		font-family: Arial, sans-serif;
	}
	.navbar {
		background-color: #111;
		color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 20px;
		position: sticky;
		top: 0;
		z-index: 1000;
	}
	.navbar .title {
		font-size: 1.5rem;
		font-weight: bold;
	}
	.navbar .profile-btn {
		background-color: #f39c12;
		border: none;
		padding: 8px 16px;
		color: #fff;
		border-radius: 5px;
		cursor: pointer;
	}
	.navbar .profile-btn:hover {
		background-color: #d87c08;
	}
	.movies-container {
		padding: 20px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
	}
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

<div class="navbar">
	<div class="title">CineHub</div>
	<button class="profile-btn" onclick={goToLogin}>Profile</button>
</div>


<h1>Hi, {data.user.email}!</h1>
<h2>{data.user.role}</h2>
<p>Your user ID is {data.user.id}.</p>
<form method="post" action="?/logout" use:enhance>
	<button>Sign out</button>
</form>


<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>
<div>
	<button onclick={() => switchToLanguage('en')}>en</button>
	<button onclick={() => switchToLanguage('de')}>de</button>
</div>


<div class="movies-container">
	{#each movies as movie}
		<div class="movie-card">
			<img src={movie.poster} alt="{movie.title} Poster">
			<div class="details">
				<h3 class="title">{movie.title}</h3>
				<p class="description">{movie.description}</p>
			</div>
		</div>
	{/each}
</div>