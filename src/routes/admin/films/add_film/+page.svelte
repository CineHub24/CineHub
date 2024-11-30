<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
  
    let searchQuery = '';
    let searchResults: { id: string; title: string; genre: string; director: string, poster:string }[] = [];
    let isLoading = false;
  
    async function fetchFilms() {
      if (!searchQuery) return;
      isLoading = true;
  
      try {
        const res = await fetch(`/api/films/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        searchResults = data.results || [];
      } catch (err) {
        console.error('Error fetching films:', err);
      } finally {
        isLoading = false;
      }
    }
  
    async function saveFilm(film: { title: string; genre: string; director: string, poster: string }) {
      try {
        const res = await fetch('/api/films/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(film),
        });
  
        if (res.ok) {
          alert('Film saved successfully!');
          goto('/admin/films/display_films'); // Redirect to the films page
        } else {
          alert('Failed to save film');
        }
      } catch (err) {
        console.error('Error saving film:', err);
        alert('An error occurred while saving the film');
      }
    }
  </script>
  
  <style>
    .film {
      margin-bottom: 1rem;
      border: 1px solid #ccc;
      padding: 1rem;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
    }
  
    .film h3 {
      margin: 0;
    }
  
    .film p {
      margin: 0.5rem 0;
    }
  </style>
  
  <h1>Search for Films</h1>
  
  <div>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Enter a film title"
      on:keypress={(e) => e.key === 'Enter' && fetchFilms()}
    />
    <button on:click={fetchFilms} disabled={isLoading}>
      {isLoading ? 'Searching...' : 'Search'}
    </button>
  </div>
  
  {#if searchResults && searchResults.length > 0}
    <div>
      {#each searchResults as film}
        <div class="film">
          <h3>{film.title}</h3>
          <img src={`${film.poster}`} alt={film.title} width="200" height="400"/>
          <p><strong>Genre:</strong> {film.genre}</p>
          <p><strong>Director:</strong> {film.director}</p>
          <button on:click={() => saveFilm(film)}>Save to Database</button>
        </div>
      {/each}
    </div>
  {:else if !isLoading && searchQuery}
    <p>No results found for "{searchQuery}".</p>
  {/if}
  

  <p>Press <a href="/admin/films/display_films">Here</a> to go Back to Films</p>