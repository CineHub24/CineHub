<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import { is } from 'drizzle-orm';
	import type { PageServerData } from './$types';
    import * as m from '$lib/paraglide/messages.js';

	let { data }: { data: PageServerData } = $props();

	const { ticketTypes } = data;

	let isCreatingNewticketType = $state(false);
	let editingticketTypeId = $state<number | null>(null);

	function cancelEdit() {
		isCreatingNewticketType = false;
		editingticketTypeId = null;
	}

	function startNewticketType() {
		isCreatingNewticketType = true;
		editingticketTypeId = null;
	}

	ticketTypes.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0);
</script>

<div class="container">
	<h1 class="page-title">{m.ticket_types_management({})}</h1>

	{#if !isCreatingNewticketType}
		<button class="new-priceset-btn" onclick={() => languageAwareGoto('/admin/price-set')}
			>{m.manage_price_sets({})}</button
		>

		<button class="new-priceset-btn" onclick={startNewticketType}>
			{m.create_new_ticket_type({})}
		</button>
	{/if}
	{#if isCreatingNewticketType}
		<button class="new-priceset-btn" onclick={cancelEdit}>
			{m.cancel_with_arrow({})}
		</button>
	{/if}

	<div class="priceset-grid">
		{#if isCreatingNewticketType}
			<div class="priceset-card">
				<h2 class="priceset-title">{m.new_ticket_type({})}</h2>

				<form method="POST" action="?/createTicketType">
					<div class="form-group">
						<label for="name">{m.ticket_type_name({})}</label>
						<input
							class="form-input"
							placeholder={m.ticket_type_name({})}
							name="name"
							type="text"
							required
						/>
					</div>

					<div class="form-group">
						<label for="factor">{m.factor({})}</label>
						<input
							class="form-input"
							type="number"
							step="0.01"
							name="factor"
							placeholder={m.ticket_type_factor({})}
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
							placeholder={m.ticket_type_description({})}
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
			</div>
		{/if}

		{#each ticketTypes as ticketType}
			<div class="priceset-card">
				{#if editingticketTypeId === ticketType.id}
					<form method="POST" action="?/updateTicketType">
						<input type="hidden" name="id" value={ticketType.id} />

						<div class="form-group">
							<label for="name">{m.ticket_type_name({})}</label>
							<input
								class="form-input"
								placeholder={m.ticket_type_name({})}
								name="name"
								type="text"
								value={ticketType.name}
								required
							/>
						</div>

						<div class="form-group">
							<label for="factor">{m.factor({})}</label>
							<input
								class="form-input"
								type="number"
								step="0.01"
								name="factor"
								placeholder={m.ticket_type_factor({})}
								value={ticketType.factor}
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
								placeholder={m.ticket_type_description({})}
								value={ticketType.description}
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
					<h2 class="priceset-title">{ticketType.name}</h2>
					<p>{m.factor({})}: {Math.round(parseFloat(ticketType.factor ?? '1.0') * 100)}%</p>
					<p>{m.description({})}: {ticketType.description}</p>

					<div class="card-actions">
						<button class="btn btn-edit" onclick={() => (editingticketTypeId = ticketType.id)}>
							{m.edit({})}
						</button>

						<form method="POST" action="?/deleteTicketType">
							<input type="hidden" name="id" value={ticketType.id} />
							<button type="submit" class="btn btn-delete">
								{m.delete_something({})}
							</button>
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
