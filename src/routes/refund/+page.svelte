<script lang="ts">
	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { formatDate, formatTime } from '$lib/utils/formatter.js';

	let { data }: { data: PageData } = $props();
	let { refundableShows } = data;

	function collectRefund() {
		// Add logic to process refund
	}

	function bookNewTicket() {
		// Add logic to book new ticket
	}
</script>

<div class="refund-page">
	<div class="refund-container">
		<h1>{m.refund_options_for_cancelled_shows({})}</h1>

		{#if refundableShows.length === 0}
			<p class="no-shows">{m.no_refundable_shows({})}</p>
		{:else}
			<p class="info">
				{m.apology_and_instructions({})}
			</p>

			{#each refundableShows as show}
				<div class="show-card">
					<h2>{show.filmTitle}</h2>
					<p class="show-details">{m.date({})}: {formatDate(show.date)} | {m.time({})}: {formatTime(show.time)}</p>
					<p class="show-details">{m.booked_seats({})}: {show.ticketCount}</p>
					<p class="refund-amount">{m.refund_amount({})}: {show.totalPrice}€</p>

					<div class="options">
						<button class="refund-btn" onclick={() => collectRefund()}
							>{m.collect_refund({})}</button
						>
						<button class="book-btn" onclick={() => bookNewTicket()}>{m.book_new_ticket({})}</button
						>
					</div>
				</div>
			{/each}
		{/if}

		<div class="form-actions">
			<a href="/" class="home-link">{m.return_to_home({})}</a>
		</div>
	</div>
</div>

<style>
	.refund-page {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding: 2rem;
	}

	.refund-container {
		max-width: 800px;
		margin: 0 auto;
		background-color: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	h1 {
		color: #333;
		margin-bottom: 1rem;
	}

	.info,
	.no-shows {
		color: #666;
		margin-bottom: 2rem;
	}

	.show-card {
		background-color: #f9f9f9;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.show-card h2 {
		color: #333;
		margin: 0 0 0.5rem 0;
	}

	.show-details,
	.refund-amount {
		color: #666;
		margin: 0.5rem 0;
	}

	.options {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: background-color 0.3s ease;
	}

	.refund-btn {
		background-color: #28a745;
		color: white;
	}

	.refund-btn:hover {
		background-color: #218838;
	}

	.book-btn {
		background-color: #007bff;
		color: white;
	}

	.book-btn:hover {
		background-color: #0056b3;
	}

	.form-actions {
		margin-top: 2rem;
		text-align: center;
	}

	.home-link {
		color: #007bff;
		text-decoration: none;
		font-weight: 600;
	}

	.home-link:hover {
		text-decoration: underline;
	}
</style>
