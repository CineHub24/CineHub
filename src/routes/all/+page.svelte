<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageServerData } from './$types';
    import type { Film } from '$lib/server/db/schema';
    import MovieCard from '$lib/components/movie_card.svelte';
    import Button from '$lib/components/button.svelte';
    import Input from '$lib/components/input.svelte';
    import Select from '$lib/components/select.svelte';
	import { age_rating } from '$lib/paraglide/messages';

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
        'Alle', 'Action', 'Komödie', 'Drama', 'Horror',
        'Science Fiction', 'Familie', 'Animation'
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
        .filter(movie => {
            const matchesSearch = movie.title
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesGenre =
                selectedGenre === 'all' || movie.genre.includes(selectedGenre);

            return matchesSearch && matchesGenre;
        })
        .sort((a, b) => {
            if (selectedSort === 'title') {
                return a.title.localeCompare(b.title);
            } else if (selectedSort === 'rating') {
                return b.runtime - a.title;
            } else if (selectedSort === 'releaseDate') {
                return (
                    new a.ageRating -
                    new b.ageRating
                );
            }
            return 0;
        });
</script>

<svelte:head>
    <title>Alle Filme | Kino XYZ</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-6">
    <header class="mb-8">
        <h1 class="mb-4 text-3xl font-bold text-gray-800">
            Unser Filmprogramm
        </h1>
        
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
            <option value={genre === 'Alle' ? 'all' : genre}>
                {genre}
            </option>
        {/each}
    </Select>

    <Select
        bind:value={selectedSort}
        class="w-40 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
        <option value="title">Nach Titel</option>
        <option value="rating">Nach Bewertung</option>
        <option value="releaseDate">Nach Erscheinungsdatum</option>
    </Select>

            <div class="ml-auto flex gap-2">
                <Button on:click={() => (viewMode = 'grid')}>
                    Kachelansicht
                </Button>
                <Button on:click={() => (viewMode = 'list')}>
                    Listenansicht
                </Button>
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
        <div class="flex h-64 items-center justify-center">
            <p class="text-lg text-gray-600">Keine Filme gefunden.</p>
        </div>
    {:else}
        <div
            class={
                viewMode === 'grid'
                    ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'space-y-4'
            }
        >
            {#each filteredMovies as movie (movie.id)}
                {#if viewMode === 'grid'}
                    <MovieCard {movie} url="/film/{movie.id}"/>
                {:else}
                    <div class="flex gap-4 rounded-lg bg-white p-4 shadow-sm">
                        <img
                            src={movie.poster}
                            alt={movie.title}
                            class="h-48 w-32 rounded-md object-cover"
                        />
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
