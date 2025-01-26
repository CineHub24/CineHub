<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageServerData } from './$types';
	import type { Film } from '$lib/server/db/schema';
	import MovieCard from '$lib/components/movie_card.svelte';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import Select from '$lib/components/select.svelte';
	import { age_rating } from '$lib/paraglide/messages';
	import { showNotification } from '$lib/stores/notification';
	import { LayoutGrid, List } from 'lucide-svelte';

	// PageServerData wird als "export let data" entgegengenommen
	export let data: PageServerData;

	type FilmWithTrailer = Film & {
		trailer?: string; // Optionales Trailer-Attribut
	};

	// Initialisierung der Variablen
	let movies: FilmWithTrailer[] = data.movies;
	let searchQuery = '';
	let selectedGenre = 'all';
	let selectedSort = 'title';
	let viewMode = 'grid';
	let isLoading = true;
	let filteredMovies: FilmWithTrailer[] = [];

	const genres = [
		'Alle Genres',
		'Action',
		'Komödie',
		'Drama',
		'Horror',
		'Science Fiction',
		'Familie',
		'Animation'
	];

	onMount(async () => {
		try {
			// Beispiel: Hier würde der tatsächliche API-Call stehen
			const response = await fetch('/api/movies');
			movies = await response.json();
			// Direkt einmal filtern/kopieren
			filteredMovies = [...movies];
		} catch (error) {
			console.error('Fehler beim Laden der Filme:', error);
		} finally {
			isLoading = false;
		}
	});

	// Reaktiver Block, der immer getriggert wird, wenn sich movies, searchQuery,
	// selectedGenre oder selectedSort ändern
	$: filteredMovies = movies
		.filter((movie) => {
			const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesGenre = selectedGenre === 'all' || movie.genres.includes(selectedGenre);

			return matchesSearch && matchesGenre;
		})
		.sort((a, b) => {
			if (selectedSort === 'title') {
				return a.title.localeCompare(b.title);
			} else if (selectedSort === 'rating') {
				return b.runtime - a.title;
			} else if (selectedSort === 'releaseDate') {
				return new a.ageRating() - new b.ageRating();
			}
			return 0;
		});
</script>

<div class="min-h-screen bg-gray-50 p-6">
	<header class="mb-8">
		<h1 class="mb-4 text-3xl font-bold text-gray-800">Unser Filmprogramm</h1>

		<!-- Filter und Suchbereich -->
		<div class="flex flex-wrap gap-4">
			<Input
				type="search"
				placeholder="Film suchen..."
				class="max-w-xs rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				bind:value={searchQuery}
			/>

			<Select
				bind:value={selectedGenre}
				class="w-40 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				{#each genres as genre}
					<option value={genre === 'Alle Genres' ? 'all' : genre}>
						{genre}
					</option>
				{/each}
			</Select>

			<div class="ml-auto flex items-center">
				<div class="flex rounded-lg bg-gray-100 p-1 shadow-inner">
					<!-- Grid View Toggle -->
					<div
						class="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 transition-all duration-200 {viewMode ===
						'grid'
							? 'bg-white text-blue-600 shadow-sm'
							: 'text-gray-600 hover:text-gray-900'}"
						on:click={() => (viewMode = 'grid')}
					>
						<LayoutGrid size={20} />
						<span class="hidden sm:inline">Kacheln</span>
					</div>

					<!-- List View Toggle -->
					<div
						class="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 transition-all duration-200 {viewMode ===
						'list'
							? 'bg-white text-blue-600 shadow-sm'
							: 'text-gray-600 hover:text-gray-900'}"
						on:click={() => (viewMode = 'list')}
					>
						<List size={20} />
						<span class="hidden sm:inline">Liste</span>
					</div>
				</div>
			</div>
		</div>
	</header>

	{#if isLoading}
		<div class="flex h-64 items-center justify-center">
			<div
				class="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
			></div>
		</div>
	{:else if filteredMovies.length === 0}
		<div class="flex h-64 flex-col items-center justify-center space-y-4">
			<svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
				/>
			</svg>
			<p class="text-lg font-medium text-gray-600">Keine Filme gefunden</p>
			<p class="text-sm text-gray-500">Bitte passen Sie Ihre Suchkriterien an</p>
		</div>
	{:else}
		<div
			class={viewMode === 'grid'
				? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
				: 'space-y-4'}
		>
			{#each filteredMovies as movie (movie.id)}
				{#if viewMode === 'grid'}
					<MovieCard {movie} url="/film/{movie.id}" />
				{:else}
					<div class="flex gap-4 rounded-lg bg-white p-4 shadow-sm">
						<img src={movie.poster} alt={movie.title} class="h-48 w-32 rounded-md object-cover" />
						<div>
							<h3 class="mb-2 text-xl font-semibold">
								{movie.title}
							</h3>
							<p class="mb-2 text-sm text-gray-600">
								{movie.runtime} Min. |
								{movie.genres.join(', ')}
							</p>
							<p class="mb-4 line-clamp-3 text-gray-700">
								{movie.description}
							</p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
