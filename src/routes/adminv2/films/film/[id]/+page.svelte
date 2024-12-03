<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    export let data;
    let {filme} = data
    // let filme = [
    //     { id: 1, titel: 'Inception', genre: 'Sci-Fi', bewertung: 9 },
    //     { id: 2, titel: 'The Matrix', genre: 'Action', bewertung: 8 }
    // ];

    $: film = filme.find(f => f.id === parseInt($page.params.id));

    function speichern() {
        // In einer echten Anwendung würden Sie hier die Daten speichern
        console.log('Film gespeichert:', film);
        goto('/');
    }

    function zurueck() {
        history.back();
    }
</script>

{#if film}
    <div class="container">
        <h2>Film bearbeiten</h2>
        
        <form method="post" action="?/update" name="update">
            <div class="form-group">
                <label for="title">Titel:</label>
                <input 
                    name="title" 
                    bind:value={film.title} 
                    type="text" 
                    required
                >
            </div>

            <div class="form-group">
                <label for="genre">Genre:</label>
                <input 
                    name="genre" 
                    bind:value={film.genre} 
                    type="text" 
                    required
                >
            </div>

            <div class="form-group">
                <label for="runtime">Laufzeit:</label>
                <input 
                    name="runtime" 
                    bind:value={film.runtime} 
                    type="text" 
                    required
                >
            </div>
            <div class="form-group">
                <label for="director">Regiseur:</label>
                <input 
                    name="director" 
                    bind:value={film.director} 
                    type="text" 
                    required
                >
            </div>
            <div class="form-group">
                <label for="description">Beschreibung:</label>
                <input 
                    name="description" 
                    bind:value={film.description} 
                    type="text" 
                    required
                >
            </div>

            <div class="actions">
                <button type="submit">Speichern</button>
                <button type="button" on:click={zurueck}>Zurück</button>
            </div>
        </form>
    </div>
{:else}
    <p>Film nicht gefunden</p>
{/if}

<style>
    .container {
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
    }
    .form-group {
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
    }
    label {
        margin-bottom: 5px;
    }
    input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    .actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    button {
        padding: 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    button[type="submit"] {
        background-color: #4CAF50;
        color: white;
    }
    button[type="button"] {
        background-color: #f0f0f0;
    }
</style>