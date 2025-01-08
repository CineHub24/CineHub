<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import type { PageData, ActionData } from './$types.js';
	import * as m from '$lib/paraglide/messages.js';
	import MultiSelect from 'svelte-multiselect';
	import { Tag, Save, ArrowBigLeft, Edit, Trash2, CircleX } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const { priceSets, seatCategories, ticketTypes } = data;

	let selectedPriceSet = $state<(typeof priceSets)[0] | null>(null);
	let selectedTicketTypes = $state<{ value: number; label: string }[]>([]);
	let selectedSeatCategories = $state<{ value: number; label: string }[]>([]);
	let isCreatingNewPriceSet = $state(false);

	const sortedPriceSets = $derived(
		priceSets.toSorted((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
	);
	const sortedSeatCategories = $derived(
		seatCategories.toSorted((a, b) => parseFloat(a.price ?? '0') - parseFloat(b.price ?? '0'))
	);
	const sortedTicketTypes = $derived(
		ticketTypes.toSorted((a, b) => parseFloat(a.factor ?? '0') - parseFloat(b.factor ?? '0'))
	);

	const formattedSeatCategories = $derived(
		sortedSeatCategories.map((category) => ({
			value: category.id,
			label: formatSeatCategory(category)
		}))
	);

	const formattedTicketTypes = $derived(
		sortedTicketTypes.map((type) => ({
			value: type.id,
			label: formatTicketType(type)
		}))
	);

	function handleEdit(set: (typeof priceSets)[0]) {
		selectedPriceSet = set;
		selectedSeatCategories = [];
		selectedTicketTypes = [];
		sortedSeatCategories.map((category) => {
			if (set.seatCategoryPrices.includes(category.id)) {
				selectedSeatCategories.push({
					value: category!.id,
					label: formatSeatCategory(category)
				});
			}
		});
		sortedTicketTypes.map((type) => {
			if (set.ticketTypes.includes(type.id)) {
				selectedTicketTypes.push({
					value: type!.id,
					label: formatTicketType(type)
				});
			}
		});

		isCreatingNewPriceSet = false;
	}

	function getPriceSetDetails(set: (typeof priceSets)[0]) {
		const appliedSeatCategories = set.seatCategoryPrices
			.map((id) => seatCategories.find((category) => category.id === id))
			.filter(Boolean);

		const appliedTicketTypes = set.ticketTypes
			.map((id) => ticketTypes.find((type) => type.id === id))
			.filter(Boolean);

		return {
			appliedSeatCategories,
			appliedTicketTypes
		};
	}

	function startNewPriceSet() {
		isCreatingNewPriceSet = true;
		selectedSeatCategories = [];
		selectedTicketTypes = [];
	}
	function cancelEdit() {
		isCreatingNewPriceSet = false;
		selectedPriceSet = null;
	}

	function formatSeatCategory(category: any) {
		return `${category.name}${category.description ? ' ('+ category.description + ')': ''}: ${category.price}€`;
	}

	function formatTicketType(type: any) {
		return `${type.name}${type.description ? ' ('+ type.description + ')': ''}: (${Math.round(parseFloat(type.factor ?? '1') * 100)}%)`;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-800">{m.price_set_management({})}</h1>

	{#if form}
		<div class="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{form.message}</div>
	{/if}

	<div class="mb-8 flex flex-wrap gap-4">
		<button
			class="flex items-center gap-2 rounded bg-blue-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-600"
			onclick={() => languageAwareGoto('/admin/pricing')}
		>
			<ArrowBigLeft class="h-5 w-5" />
			{m.back({})}
		</button>
		{#if !isCreatingNewPriceSet}
			<button
				class="flex items-center gap-2 rounded bg-green-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-green-600"
				onclick={startNewPriceSet}
			>
				<Tag class="h-5 w-5" />
				{m.create_new_price_set({})}
			</button>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#if isCreatingNewPriceSet}
			<div
				class="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				<h2 class="mb-4 text-2xl font-semibold text-gray-800">{m.new_price_set({})}</h2>
				<form method="POST" action="?/createPriceSet" name="createPriceSet">
					<label for="name" class="mb-2 block text-gray-700">{m.name_of_price_set({})}:</label>
					<input
						class="mb-4 w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						placeholder={m.name_of_price_set({})}
						name="name"
						required
					/>
					<label for="priceFactor" class="mb-2 block text-gray-700">{m.price_factor({})}:</label>
					<input
						class="mb-4 w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						type="number"
						step="0.01"
						placeholder={m.price_factor_placeholder({})}
						name="priceFactor"
						required
					/>
					<div class="mb-4">
						<strong class="mb-2 block text-gray-700">{m.choose_seat_categories({})}:</strong>
						<MultiSelect
							name="seatCategoryPrices"
							options={formattedSeatCategories}
							bind:selected={selectedSeatCategories}
						/>
						<input type="hidden" name="seatCategoryPrices" value={selectedSeatCategories} />
					</div>

					<div class="mb-4">
						<strong class="mb-2 block text-gray-700">{m.choose_ticket_types({})}:</strong>
						<MultiSelect
							name="ticketTypes"
							options={formattedTicketTypes}
							bind:selected={selectedTicketTypes}
						/>
						<input type="hidden" name="ticketTypes" value={selectedTicketTypes} />
					</div>
					<div class="flex justify-between">
						<button
							class="flex items-center gap-2 rounded bg-green-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-green-600"
							type="submit"
						>
							<Save class="h-5 w-5" />
							{m.save({})}
						</button>
						<button
							class="flex items-center gap-2 rounded bg-red-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-red-600"
							onclick={cancelEdit}
						>
							<Trash2 class="h-5 w-5" />
							{m.cancel({})}
						</button>
					</div>
				</form>
			</div>
		{/if}
		{#each sortedPriceSets as priceSet}
			{@const { appliedSeatCategories, appliedTicketTypes } = getPriceSetDetails(priceSet)}
			<div
				class="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				{#if selectedPriceSet?.id == priceSet.id}
					<form method="POST" action="?/updatePriceSet" name="updatePriceSet">
						<input type="hidden" name="priceSetId" value={priceSet.id} />
						<div class="mb-4">
							<label for="name" class="mb-2 block text-gray-700">{m.name_of_price_set({})}:</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder={m.name_of_price_set({})}
								name="name"
								type="text"
								value={priceSet.name}
								required
							/>
						</div>
						<div class="mb-4">
							<label for="priceFactor" class="mb-2 block text-gray-700">{m.price_factor({})}:</label
							>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								type="number"
								step="0.01"
								name="priceFactor"
								placeholder={m.price_factor({})}
								value={priceSet.priceFactor}
								required
							/>
						</div>
						<div class="mb-4">
							<strong class="mb-2 block text-gray-700">{m.seat_categories({})}:</strong>
							<MultiSelect
								name="seatCategoryPrices"
								options={formattedSeatCategories}
								bind:selected={selectedSeatCategories}
							/>
						</div>

						<div class="mb-4">
							<strong class="mb-2 block text-gray-700">{m.ticket_types({})}:</strong>
							<MultiSelect
								name="ticketTypes"
								options={formattedTicketTypes}
								bind:selected={selectedTicketTypes}
							/>
						</div>
						<div class="flex justify-between">
							<button
								class="flex items-center gap-2 rounded bg-green-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-green-600"
								type="submit"
							>
								<Save class="h-5 w-5" />
								{m.save({})}
							</button>
							<button
								class="flex items-center gap-2 rounded bg-red-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-red-600"
								onclick={cancelEdit}
							>
								<CircleX class="h-5 w-5" />
								{m.cancel({})}
							</button>
						</div>
					</form>
				{:else}
					<h2 class="mb-4 text-2xl font-semibold text-gray-800">{priceSet.name}</h2>
					<div class="mb-4 rounded-lg bg-gray-100 p-2">
						{m.price_factor({})}
						{m.for_base_prices({})}: {Math.round(parseFloat(priceSet.priceFactor ?? '1') * 100)}%
					</div>

					<div class="mb-4">
						<strong class="mb-2 block text-gray-700"
							>{m.seat_categories({})} {m.including_base_prices({})}:</strong
						>
						<ul class="rounded-lg bg-gray-100 p-2">
							{#each appliedSeatCategories as category}
								{#if category}
									<li class="mb-1 rounded bg-white p-2 last:mb-0">
										{formatSeatCategory(category)}
									</li>
								{:else}
									<li class="rounded bg-white p-2">{m.no_seat_categories({})}</li>
								{/if}
							{/each}
						</ul>
					</div>

					<div class="mb-4">
						<strong class="mb-2 block text-gray-700"
							>{m.ticket_types({})} {m.including_price_factors({})}:</strong
						>
						<ul class="rounded-lg bg-gray-100 p-2">
							{#each appliedTicketTypes as type}
								{#if type}
									<li class="mb-1 rounded bg-white p-2 last:mb-0">{formatTicketType(type)}</li>
								{:else}
									<li class="rounded bg-white p-2">{m.no_ticket_types({})}</li>
								{/if}
							{/each}
						</ul>
					</div>
					<div class="flex justify-between">
						<button
							class="flex items-center gap-2 rounded bg-blue-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-600"
							onclick={() => handleEdit(priceSet)}
						>
							<Edit class="h-5 w-5" />
							{m.edit({})}
						</button>
						<form action="?/delete" method="POST">
							<input type="hidden" name="priceSetId" value={priceSet.id} />
							<button
								class="flex items-center gap-2 rounded bg-red-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-red-600"
								type="submit"
							>
								<Trash2 class="h-5 w-5" />
								{m.delete_something({})}
							</button>
						</form>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
