<script lang="ts">
	import type { PageServerData } from './$types';
	const { data }: { data: PageServerData } = $props();
  const { user, show, hall, seatCategories, priceSet } = data;
</script>

<div class="container">
	{#if show}
		<img class="poster" src={show.poster} alt={show.title} />

		<div class="details">
			<h1>{show.title}</h1>
			<p>{show.description}</p>
			<p><strong>Erscheinungsdatum:</strong> {show.year}</p>
		</div>
		<div class="show-details">
			<h2>Vorstellungsdetails</h2>
			<p><strong>Datum:</strong> {show.date}</p>
			<p><strong>Uhrzeit:</strong> {show.time}</p>
			<p><strong>Kino:</strong> {hall.name}</p>
			<p><strong>Preis pro Ticket:</strong></p>
			{#if seatCategories}
				{#each seatCategories as category}
					<p>
						<strong
							>{category.name}: {Math.ceil(
								parseFloat(category.price ?? '0.0') * parseFloat(priceSet.priceFactor ?? '1')
							) - 0.01} €</strong
						>
					</p>
				{/each}
			{/if}
			<!-- <div class="showtime">
				<button> Zur Buchung →</button>
			</div> -->
			<!-- <form method="POST" action="/createBooking">
				<button type="submit">Zur Buchung →</button>
			</form> -->
			<!-- const response = await fetch('?/fetchFullMovieDetails', {
				method: 'POST',
				body: formData
			}); -->

			<form
			class="form"
			method="POST"
			action="?/createBooking"
			>
			<input type="hidden" name="userId" value={user.id} />
			<button type="submit">Zur Buchung →</button>
			</form>
		</div>
	{:else}
		<p>Die Vorstellung wurde nicht gefunden.</p>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
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
