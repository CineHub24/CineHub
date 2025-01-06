<script lang="ts">
	import type { PageServerData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	const { data }: { data: PageServerData } = $props();
	const { show, hall, seatCategories, priceSet } = data;
</script>

<div class="container">
	<img class="poster" src={show.poster} alt={show.title} />

	{#if show}
		<div class="details">
			<h1>{show.title}</h1>
			<p>{show.description}</p>
			<p><strong>{m.release_date({})}</strong> {show.year}</p>
		</div>
		<div class="show-details">
			<h2>{m.show_details({})}</h2>
			<p><strong>{m.date({})}</strong> {show.date}</p>
			<p><strong>{m.time({})}</strong> {show.time}</p>
			<p><strong>{m.cinema({})}</strong> {hall.name}</p>
			<p><strong>{m.price_per_ticket({})}</strong></p>
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
			<div class="showtime">
				<button> {m.to_booking({})}</button>
			</div>
		</div>
	{:else}
		<p>{m.show_not_found({})}</p>
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
