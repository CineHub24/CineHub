<script>
	export let data;
    const {filme} = data
	// [
    //     { id: 1, titel: 'Inception', genre: 'Sci-Fi', bewertung: 9 },
    //     { id: 2, titel: 'The Matrix', genre: 'Action', bewertung: 8 }
    // ];
</script>

<div class="container">
    <h1>Filme</h1>
    
    <div class="film-liste">
        {#each filme as film (film.id)}
            <div class="film-item">
                <a href="/adminv2/films/film/{film.id}">
                    {film.title} - {film.genre}
                </a>
            </div>
        {/each}
    </div>
</div>	

<style>
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }
    .film-liste {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .film-item {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }
    a {
        text-decoration: none;
        color: #333;
    }
</style>