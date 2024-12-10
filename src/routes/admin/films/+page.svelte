<script>
	export let data;
    const {filme} = data
</script>

<div class="container">
    <h1>Filme</h1>
    <a href="/admin/add_films">Filme Hinzufügen</a><br>
    <a href="/admin/add_room">Kinosaal Hinzufügen</a><br>
    <div class="film-liste">    
        {#each filme as film (film.id)}
            <div class="film-item">
                <a href="/admin/films/film/{film.id}">
                    {film.title} - {film.genres}        
                    <!-- TODO - genres is a array  -->
					<img src={film.poster} alt= {film.title}>
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