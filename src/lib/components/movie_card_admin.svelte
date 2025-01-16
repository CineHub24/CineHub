<script lang="ts">
    let { movie, url } = $props();
    
    function openTrailer(event: Event) {
        event.stopPropagation();
        if (movie.trailer) {
            window.open(movie.trailer, "_blank");
        }
    }
</script>

<div class="card-container">
    <div class="movie-card">
        <img src={movie.poster} alt="{movie.title} Poster" />
        <div class="buttons">
            <button class="button edit-button">Bearbeiten</button>
        </div>
    </div>
    <div class="movie-info">
        <h3 class="title">{movie.title}</h3>
        <div class="admin-details">
            <p>ID: {movie.id}</p>
            <p>Laufzeit: {movie.duration} Min.</p>
            <p>FSK: {movie.rating}</p>
            <p>Status: {movie.status}</p>
            <p>Vorführungen: {movie.showings}</p>
        </div>
    </div>
</div>

<style>
    .card-container {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }

    .movie-card {
        position: relative;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        height: 290px;
        width: 200px;
    }

    .movie-card img {
        width: 100%;
        height: calc(100% - 45px);
        object-fit: cover;
    }

    .movie-info {
        flex: 1;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 8px;
        border: 1px solid #ddd;
    }

    .title {
        font-size: 1.2rem;
        margin-bottom: 15px;
        font-weight: bold;
    }

    .admin-details p {
        margin: 5px 0;
        font-size: 0.9rem;
    }

    .buttons {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 8px;
        background-color: #f5f5f5;
    }

    .button {
        width: 100%;
        padding: 8px 0;
        font-size: 0.9rem;
        text-align: center;
        border-radius: 5px;
        cursor: pointer;
    }

    .edit-button {
        background-color: #007bff;
        color: white;
        border: none;
    }

    .edit-button:hover {
        background-color: #0056b3;
    }
</style>