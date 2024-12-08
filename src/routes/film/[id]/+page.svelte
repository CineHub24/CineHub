<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    const movieTitle = "The Wolf of Wall Street";
    const ageRating = "FSK 16";
    const releaseYear = 2013;
    const genre = "Komödie/Thriller";
    const duration = "3 Stunden";
    const description = `Mit Anfang 20 gründet der Aktienhändler Jordan Belfort seine eigene Firma, die schnell zum großen Erfolg wird. 
    Er wird zum Multimillionär und Star an der New Yorker Börse, der von allen nur "Wolf of Wall Street" genannt wird. 
    Jordan genießt sein ausschweifendes Luxusleben in vollen Zügen und fühlt sich unbesiegbar. 
    Seine unstillbare Gier nach mehr Geld bringt ihn schließlich dazu, sich gemeinsam mit seinen Freunden auf illegale Geschäfte einzulassen. 
    Doch das FBI ist ihm bald auf den Fersen.`;
    const releaseDate = "16. Januar 2014";
  
    const showtimes = [
      { date: "Freitag 17. Mai", time: "17:00 Uhr" },
      { date: "Freitag 17. Mai", time: "18:30 Uhr" },
      { date: "Freitag 17. Mai", time: "20:15 Uhr" },
      { date: "Freitag 17. Mai", time: "22:00 Uhr" },
      { date: "Samstag 17. Mai", time: "17:00 Uhr" },
      { date: "Sonntag 17. Mai", time: "19:00 Uhr" },
    ];
    export let data;
    const {movie} = data
    const {shows} = data;

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
      <p><strong>Erscheinungsdatum:</strong> {movie.releaseDate}</p>
    </div>
    <div class="showtimes">
      {#each shows as show}
        <div class="showtime">
          <p><strong>{show.date}</strong></p>
          <p>{show.time}</p>
          <button>Zur Buchung →</button>
        </div>
      {/each}
    </div>
    {:else}
    <p>Der Film wurde nicht gefunden.</p>
    {/if}
  
  </div>
  