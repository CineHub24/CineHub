<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import type { PageServerData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	let { data }: { data: PageServerData } = $props();

	const { seatCategories } = data;

	let isCreatingNewSeatCategory = $state(false);
	let editingSeatCategoryId = $state<number | null>(null);
	let hovered = $state(false);

	function cancelEdit() {
		isCreatingNewSeatCategory = false;
		editingSeatCategoryId = null;
	}

	function startNewSeatCategory() {
		isCreatingNewSeatCategory = true;
		editingSeatCategoryId = null;
	}

	// Sort seat categories
	seatCategories.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0);
</script>

<div class="container">
	<h1 class="page-title">{m.seat_categories_management({})}</h1>

	{#if isCreatingNewSeatCategory}
		<button class="new-priceset-btn" onclick={cancelEdit}>{m.cancel_with_arrow({})}</button>
	{/if}

	{#if !isCreatingNewSeatCategory}
		<button class="new-priceset-btn" onclick={() => languageAwareGoto('/admin/price-set')}>
			{m.manage_price_sets({})}</button
		>

		<button class="new-priceset-btn" onclick={startNewSeatCategory}>
			{m.create_new_seat_category({})}
		</button>
	{/if}

	<div class="priceset-grid">
		{#if isCreatingNewSeatCategory}
			<div class="priceset-card">
				<h2 class="priceset-title">{m.new_seat_category({})}</h2>

				<form method="POST" action="?/createSeatCategory">
					<div class="form-group">
						<label for="name">{m.seat_category_name({})}</label>
						<input
							class="form-input"
							placeholder={m.seat_category_name({})}
							name="name"
							type="text"
							required
						/>
					</div>

					<div class="form-group">
						<label for="price">{m.price({})}</label>
						<input
							class="form-input"
							type="number"
							step="0.01"
							name="price"
							placeholder={m.seat_category_price({})}
							required
						/>
					</div>
					<div class="form-group">
						<label for="description">{m.description({})}</label>
						<input
							class="form-input"
							type="text"
							step="0.01"
							name="description"
							placeholder={m.seat_category_description({})}
							required
						/>
					</div>

					<div class="form-group">
						<label for="emoji">{m.emoji({})}</label>
						<input class="form-input" type="text" name="emoji" placeholder={m.emoji({})} required />
					</div>

					<div class="form-actions">
						<button type="submit" class="btn btn-edit">{m.save({})}</button>
						<button type="button" class="btn btn-delete" onclick={cancelEdit}>
							{m.cancel({})}
						</button>
					</div>
				</form>
			</div>
		{/if}

		{#each seatCategories as seatCategory}
			<div
				class="priceset-card"
				role="group"
				onmouseover={() => (hovered = true)}
				onmouseleave={() => (hovered = false)}
				onfocus={() => (hovered = true)}
				onblur={() => (hovered = false)}
			>
				{#if editingSeatCategoryId === seatCategory.id}
					<form method="POST" action="?/updateSeatCategory">
						<input type="hidden" name="id" value={seatCategory.id} />

						<div class="form-group">
							<label for="name">{m.seat_category_name({})}</label>
							<input
								class="form-input"
								placeholder={m.seat_category_name({})}
								name="name"
								type="text"
								value={seatCategory.name}
								required
							/>
						</div>

						<div class="form-group">
							<label for="price">{m.price({})}</label>
							<input
								class="form-input"
								type="number"
								step="0.01"
								name="price"
								placeholder={m.seat_category_price({})}
								value={seatCategory.price}
								required
							/>
						</div>

						<div class="form-group">
							<label for="description">{m.description({})}</label>
							<input
								class="form-input"
								type="text"
								step="0.01"
								name="description"
								placeholder={m.seat_category_description({})}
								value={seatCategory.description}
								required
							/>
						</div>

						<div class="form-group">
							<label for="emoji">{m.emoji({})}</label>
							<input
								class="form-input"
								type="text"
								name="emoji"
								placeholder={m.emoji({})}
								value={seatCategory.emoji}
								required
							/>
						</div>

						<div class="form-actions">
							<button type="submit" class="btn btn-edit">{m.save({})}</button>

							<button type="button" class="btn btn-delete" onclick={cancelEdit}>
								{m.cancel({})}
							</button>
						</div>
					</form>
				{:else}
					<h2 class="priceset-title">{seatCategory.name}</h2>
					<p>{m.price({})}: {parseFloat(seatCategory.price ?? '0').toFixed(2)}€</p>
					<p>{m.description({})}: {seatCategory.description}</p>

					<div class="card-actions">
						<button class="btn btn-edit" onclick={() => (editingSeatCategoryId = seatCategory.id)}>
							{m.edit({})}
						</button>

						<form method="POST" action="?/deleteSeatCategory">
							<input type="hidden" name="id" value={seatCategory.id} />
							{#if seatCategory.id != 1}
								<button type="submit" class="btn btn-delete">
									{m.delete_something({})}
								</button>
							{/if}
						</form>
					</div>
					{#if seatCategory.id == 1}
						<div class="tooltip">
							{m.cannot_remove_seat_category({})}
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Open Sans', 'Helvetica Neue', sans-serif;
	}

	.page-title {
		font-size: 2.5rem;
		color: #333;
		margin-bottom: 2rem;
		border-bottom: 2px solid #4a4a4a;
		padding-bottom: 0.5rem;
	}

	.new-priceset-btn {
		display: inline-block;
		background-color: #2c3e50;
		color: white;
		padding: 0.75rem 1.5rem;
		text-decoration: none;
		border-radius: 5px;
		margin-bottom: 1.5rem;
		transition: background-color 0.3s ease;
	}

	.new-priceset-btn:hover {
		background-color: #34495e;
	}

	.priceset-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.priceset-card {
		position: relative;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.priceset-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
	}
	.tooltip {
		visibility: hidden;
		opacity: 0;
		background-color: #ff9800; /* Orange background */
		color: white;
		text-align: center;
		padding: 5px 10px; /* Adjust padding */
		border-radius: 4px;
		position: absolute;
		bottom: 110%; /* Position above the card */
		left: 50%;
		transform: translateX(-50%);
		transition: opacity 0.3s;
		z-index: 1000;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* Adding a slight shadow for emphasis */
	}

	.priceset-card:hover .tooltip,
	.priceset-card:focus-within .tooltip {
		visibility: visible;
		opacity: 1;
	}

	.priceset-title {
		font-size: 1.5rem;
		color: #2c3e50;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.card-actions {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		text-decoration: none;
		transition: background-color 0.3s ease;
	}

	.btn-edit {
		background-color: #3498db;
		color: white;
	}

	.btn-edit:hover {
		background-color: #2980b9;
	}

	.btn-delete {
		background-color: #e74c3c;
		color: white;
	}

	.btn-delete:hover {
		background-color: #c0392b;
	}
</style>
