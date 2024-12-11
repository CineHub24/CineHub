<script>
	import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    export let data;
    const { show, movie, seatCategories } = data;

    const prices = [];

</script>

<style>
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
  .show-details {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-top: 1rem;
  }
  .showtime {
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

  <img class="poster" src="{movie.poster}" alt={movie.title} />

  {#if show}
    <div class="details">
      <h1>{movie?.title ?? $page.params.id}</h1>
      <p>{movie.description}</p>
      <p><strong>Erscheinungsdatum:</strong> {movie.releaseDate}</p>
    </div>
    <div class="show-details">
      <h2>Vorstellungsdetails</h2>
      <p><strong>Datum:</strong> {show.Showing.date}</p>
      <p><strong>Uhrzeit:</strong> {show.Showing.time}</p>
      <p><strong>Kino:</strong> {show.Showing.hallid}</p>
      <p><strong>Preis pro Ticket:</p>
        {#each seatCategories as category}
          <p>{category.name}: {category.price} €</p>
        {/each}
        <div class="showtime">
          <button
          onclick={() => goto(`/film/${movie.id}/showing/${show.Showing.id}/`)}
          >
            Zur Buchung →</button>
        </div>

    </div>
  {:else}
    <p>Die Vorstellung wurde nicht gefunden.</p>
  {/if}
</div>
