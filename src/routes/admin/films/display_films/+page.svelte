<script lang="ts">
	export let data: { films: { id: number; title: string; genre: string; director: string, poster: string }[] };
  
	// Delete a film by its ID
	async function deleteFilm(id: number) {
	  const confirmed = confirm('Are you sure you want to delete this film?');
	  if (!confirmed) return;
  
	  try {
		const res = await fetch('/api/films/delete', {
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ id }),
		});
  
		if (res.ok) {
		  alert('Film deleted successfully!');
		  // Remove the film from the UI
		  data.films = data.films.filter((film) => film.id !== id);
		} else {
		  const errorData = await res.json();
		  alert(`Failed to delete film: ${errorData.message}`);
		}
	  } catch (err) {
		console.error('Error deleting film:', err);
		alert('An error occurred while deleting the film');
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
  
	.delete-btn {
	  margin-top: 0.5rem;
	  background: red;
	  color: white;
	  border: none;
	  padding: 0.5rem;
	  border-radius: 5px;
	  cursor: pointer;
	}
  </style>
  
  <h3>Films</h3>
  
  {#if data.films && data.films.length > 0}
	<div>
	  {#each data.films as film (film.id)}
		<div class="film">
		  <h3>{film.title}</h3>
		  <img src={`${film.poster}`} alt={film.title} width="200" height="400"/>
		  <p><strong>Genre:</strong> {film.genre}</p>
		  <p><strong>Director:</strong> {film.director}</p>
		  <button class="delete-btn" on:click={() => deleteFilm(film.id)}>Delete</button>
		</div>
	  {/each}
	</div>
  {:else}
	<p>No films available.</p>
  {/if}
  
  <p>Press <a href="/admin/films/add_film">Here</a> to add a Film</p>
  