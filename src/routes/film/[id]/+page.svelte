<script lang="ts">
	import { goto } from '$app/navigation';
    import { page } from '$app/stores';
	import type { PageServerData } from './$types';
    // export let data;
    // const {movie} = data
    // const {shows} = data;
    const {data}:{data:PageServerData} = $props();
    const { movie, shows } = data;
  </script>
  
  <style>
    /* Optional: Styling für die Seite */
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .poster {
      max-width: 100%;
      border-radius: 8px;
    }
    .details {
      margin: 1rem 0;
    }
    .showtimes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .showtime {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      text-align: center;
      background: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .showtime button {
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      background: #000;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
  
  <div class="container">
    <div class="header">
      <a href="/">Home</a>
      <a href="/cart">Einkaufswagen</a>
    </div>
  
    <img
      class="poster"
      src="{movie.poster}"
      alt={movie.title}
    />
  
    {#if movie}
    <div class="details">
      <h1>{movie?.title ?? $page.params.id}</h1>
      <p>{movie.description}</p>
      <p><strong>Erscheinungsdatum:</strong> {movie.year}</p>
    </div>
    <div class="showtimes">
      {#each shows as show}
        <div class="showtime">
          <p><strong>{show.date}</strong></p>
          <p>{show.time}</p>
          <button
            onclick={() => goto(`/film/${movie.id}/showing/${show.id}/`)}
            >
            Zur Buchung →</button>
        </div>
      {/each}
    </div>
    {:else}
    <p>Der Film wurde nicht gefunden.</p>
    {/if}
  
  </div>
  