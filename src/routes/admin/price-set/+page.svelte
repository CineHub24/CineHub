<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import type { PageData } from './$types.js';
	import * as m from '$lib/paraglide/messages.js';

	let { data }: { data: PageData } = $props();
	const { priceSets, seatCategories, ticketTypes } = data;

	let selectedPriceSet = $state<(typeof priceSets)[0] | null>(null);
	let isCreatingNewPriceSet = $state(false);

	let saveError: string | null = null;

	priceSets.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0);
	seatCategories.sort((a, b) => parseFloat(a.price ?? '0') - parseFloat(b.price ?? '0'));
	ticketTypes.sort((a, b) => parseFloat(a.factor ?? '0') - parseFloat(b.factor ?? '0'));

	function handleEdit(priceSet: (typeof priceSets)[0]) {
		selectedPriceSet = priceSet;
		isCreatingNewPriceSet = false;
	}

	function getPriceSetDetails(set: (typeof priceSets)[0]) {
		const appliedSeatCategories = set.seatCategoryPrices
			.map((id) => seatCategories.find((category) => category.id === id))
			.filter(Boolean);

		const appliedTicketTypes = set.ticketTypes
			.map((id) => ticketTypes.find((type) => type.id === id))
			.filter(Boolean);

		return { appliedSeatCategories, appliedTicketTypes };
	}

	function startNewPriceSet() {
		isCreatingNewPriceSet = true;
	}
	function cancelEdit() {
		isCreatingNewPriceSet = false;
		selectedPriceSet = null;
	}
</script>

<div class="container">
<<<<<<< HEAD:src/routes/admin/priceSet/+page.svelte
	<h1 class="page-title">{m.price_set_management({})}</h1>
	{#if saveError}
		{console.log(saveError)}
		<div class="error-message">{saveError}</div>
	{/if}
	{#if !isCreatingNewPriceSet}
		<button class="new-priceset-btn" onclick={() => languageAwareGoto('/admin/seatCategory')}
			>{m.seat_category_management({})}
		</button>
		<button class="new-priceset-btn" onclick={() => languageAwareGoto('/admin/ticketType')}
			>{m.ticket_type_management({})}</button
		>
=======
    <h1 class="page-title">Preissets Verwaltung</h1>
    {#if saveError}
        {console.log(saveError)}
        <div class="error-message">{saveError}</div>
    {/if}
    {#if !isCreatingNewPriceSet}
        <button class="new-priceset-btn" onclick={() => goto('/admin/seat-category')}>Sitzkategorien verwalten ⚙️ </button>
        <button class="new-priceset-btn" onclick={() => goto('/admin/ticket-type')}>TicketTypen verwalten ⚙️</button> 
>>>>>>> 26473fb9b2b306106c34f1d3afce5b125755118c:src/routes/admin/price-set/+page.svelte

		<button class="new-priceset-btn" onclick={startNewPriceSet}>{m.create_new_price_set({})}</button>
	{/if}
	{#if isCreatingNewPriceSet}
		<button class="new-priceset-btn" onclick={cancelEdit}>{m.cancel_price_set({})}</button>
	{/if}

	<div class="priceset-grid">
		{#if isCreatingNewPriceSet}
			<div class="priceset-card">
				<h2 class="priceset-title">{m.new_price_set({})}</h2>
				<form method="POST" action="?/createPriceSet" name="createPriceSet">
					<label for="name">{m.name_of_price_set({})}:</label>
					<input class="form-input" placeholder="Name des Preissets" name="name" />
					<label for="priceFactor">{m.price_factor({})}:</label>
					<input
						class="form-input"
						type="number"
						step="0.01"
						placeholder="Preisfaktor (z.B. 1.0)"
						name="priceFactor"
					/>
					<div class="priceset-detail">
						<strong>{m.choose_seat_categories({})}:</strong>
						<select multiple class="form-input" name="seatCategoryPrices">
							{#each seatCategories as category}
								<option
									value={category.id}
									selected={category.id === 1 ||
										category.id === 2 ||
										category.id === 3 ||
										category.id === 4 ||
										category.id === 5}
								>
									{category.name} ({category.description}): {category.price}€
								</option>
							{/each}
						</select>
					</div>

					<div class="priceset-detail">
						<strong>{m.choose_ticket_types({})}:</strong>
						<select multiple class="form-input" name="ticketTypes">
							{#each ticketTypes as type}
								<option
									value={type.id}
									selected={type.id === 1 ||
										type.id === 2 ||
										type.id === 3 ||
										type.id === 4 ||
										type.id === 5}
								>
									{type.name} ({type.description}): ({Math.round(
										parseFloat(type.factor ?? '1') * 100
									)}%)
								</option>
							{/each}
						</select>
					</div>
					<div class="form-actions">
						<button class="btn btn-edit" type="submit">{m.save({})}</button>
						<button class="btn btn-delete" onclick={cancelEdit}>{m.cancel({})}</button>
					</div>
				</form>
			</div>
		{/if}
		{#each priceSets as priceSet}
			{@const { appliedSeatCategories, appliedTicketTypes } = getPriceSetDetails(priceSet)}
			<div class="priceset-card">
				{#if selectedPriceSet?.id == priceSet.id}
					<form method="POST" action="?/updatePriceSet" name="updatePriceSet">
						<input type="hidden" name="priceSetId" value={priceSet.id} />
						<div class="priceset-detail">
							<label for="name">{m.name_of_price_set({})}:</label>
							<input
								class="form-input"
								placeholder={m.name_of_price_set({})}
								name="name"
								type="text"
								value={priceSet.name}
							/>
						</div>
						<div class="priceset-detail">
							<label for="priceFactor">{m.price_factor({})}:</label>
							<input
								class="form-input"
								type="number"
								step="0.01"
								name="priceFactor"
								placeholder={m.price_factor({})}
								value={priceSet.priceFactor}
							/>
						</div>
						<div class="priceset-detail">
							<strong>{m.seat_categories({})}:</strong>
							<select multiple class="form-input" name="seatCategoryPrices" required>
								{#each seatCategories as category}
									<option
										value={category.id}
										selected={appliedSeatCategories.some((cat) => cat?.id === category.id)}
									>
										{category.name} ({category.description}): {category.price}€
									</option>
								{/each}
							</select>
						</div>

						<div class="priceset-detail">
							<strong>{m.ticket_types({})}:</strong>
							<select multiple class="form-input" name="ticketTypes" required>
								{#each ticketTypes as type}
									<option
										value={type.id}
										selected={appliedTicketTypes.some((ty) => ty?.id === type.id)}
									>
										{type.name} ({type.description}): ({Math.round(
											parseFloat(type.factor ?? '1') * 100
										)}%)
									</option>
								{/each}
							</select>
						</div>

						<div class="form-actions">
							<button class="btn btn-edit" type="submit">{m.save({})}</button>
							<button class="btn btn-delete" onclick={cancelEdit}>{m.cancel({})}</button>
						</div>
					</form>
				{:else}
					<h2 class="priceset-title">{priceSet.name}</h2>
					<p>
						{m.price_factor({})} {m.for_base_prices({})}: {Math.round(
							parseFloat(priceSet.priceFactor ?? '1') * 100
						)}%
					</p>

					<div class="priceset-detail">
						<strong>{m.seat_categories({})} {m.including_base_prices({})}:</strong>
						<ul>
							{#each appliedSeatCategories as category}
								{#if category}
									<li>{category.name} ({category.description}): {category.price}€</li>
								{/if}
							{/each}
						</ul>
					</div>

					<div class="priceset-detail">
						<strong>{m.ticket_types({})} {m.including_price_factors({})}:</strong>
						<ul>
							{#each appliedTicketTypes as type}
								{#if type}
									<li>
										{type.name} ({type.description}): {Math.round(
											parseFloat(type.factor ?? '1') * 100
										)}%
									</li>
								{/if}
							{/each}
						</ul>
					</div>

					<div class="card-actions">
						<button
							class="btn btn-edit"
							onclick={() => {
								handleEdit(priceSet);
							}}
						>
							{m.edit({})}
						</button>
						<form action="?/delete" method="POST">
							<input type="hidden" name="priceSetId" value={priceSet.id} />
							<button class="btn btn-delete" type="submit">{m.delete_something({})}</button>
						</form>
					</div>
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

	.priceset-title {
		font-size: 1.5rem;
		color: #2c3e50;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.priceset-detail {
		margin-bottom: 1rem;
		flex-direction: column;
	}

	.priceset-detail strong {
		color: #34495e;
		display: block;
		margin-bottom: 0.5rem;
	}

	.priceset-detail ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	.priceset-detail ul li {
		background-color: #f4f6f7;
		padding: 0.3rem 0.5rem;
		margin-bottom: 0.25rem;
		border-radius: 3px;
		color: #2c3e50;
	}
	.priceset-detail select {
		border: 2px solid #3498db;
		border-radius: 8px;
		padding: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.priceset-detail select option {
		white-space: normal;
		word-wrap: break-word;

		border-bottom: 1px solid #e0e0e0;
		padding: 0.25rem;
	}

	.priceset-detail select option:last-child {
		border-bottom: none;
	}

	.priceset-detail select option:hover {
		background-color: #f0f0f0;
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
	.error-message {
		background-color: #ffdddd;
		color: #ff0000;
		padding: 10px;
		margin-bottom: 15px;
		border-radius: 5px;
	}
</style>
