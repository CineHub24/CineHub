<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import * as m from '$lib/paraglide/messages.js';
	import { Gift, Edit, Trash2, Plus, ArrowBigLeft, Save, CircleX } from 'lucide-svelte';
	import type { ActionData, PageData } from '../$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let { giftCards } = data;

	let isCreatingNewGiftCard = $state(false);
	let selectedGiftCard: any = $state(null);

	function startNewGiftCard() {
		isCreatingNewGiftCard = true;
	}

	function cancelEdit() {
		isCreatingNewGiftCard = false;
		selectedGiftCard = null;
	}

	function handleEdit(giftCard: any) {
		selectedGiftCard = { ...giftCard };
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-800">{m.gift_cards({})}</h1>

	<div class="mb-8 flex flex-wrap gap-4">
		<button
			class="flex items-center gap-2 rounded bg-blue-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-600"
			onclick={() => languageAwareGoto('/admin/pricing')}
		>
			<ArrowBigLeft class="h-5 w-5" />
			{m.back({})}
		</button>
		{#if !isCreatingNewGiftCard}
			<button
				class="flex items-center gap-2 rounded bg-green-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-green-600"
				onclick={startNewGiftCard}
			>
				<Plus class="h-5 w-5" />
				{m.create_new_gift_card({})}
			</button>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#if isCreatingNewGiftCard}
			<div
				class="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				<h2 class="mb-4 text-2xl font-semibold text-gray-800">{m.new_gift_card({})}</h2>
				<form method="POST" action="?/createGiftCard" name="createGiftCard">
					<label for="description" class="mb-2 block text-gray-700"
						>{m.gift_card_description({})}:</label
					>
					<input
						class="mb-4 w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						placeholder={m.gift_card_description({})}
						name="description"
						required
					/>
					<label for="amount" class="mb-2 block text-gray-700">{m.gift_card_amount({})}:</label>
					<input
						class="mb-4 w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						type="number"
						step="0.01"
						placeholder={m.gift_card_amount({})}
						name="amount"
						required
					/>
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
			</div>
		{/if}
		{#each giftCards as giftCard}
			<div
				class="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				{#if selectedGiftCard?.id === giftCard.id}
					<form method="POST" action="?/updateGiftCard" name="updateGiftCard">
						<input type="hidden" name="giftCardId" value={giftCard.id} />
						<div class="mb-4">
							<label for="description" class="mb-2 block text-gray-700"
								>{m.gift_card_description({})}:</label
							>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder={m.gift_card_description({})}
								name="description"
								type="text"
								value={giftCard.description}
								required
							/>
						</div>
						<div class="mb-4">
							<label for="amount" class="mb-2 block text-gray-700">{m.gift_card_amount({})}:</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								type="number"
								step="1"
								name="amount"
								placeholder={m.gift_card_amount({})}
								value={giftCard.amount}
								required
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
					<h2 class="mb-4 text-2xl font-semibold text-gray-800">{m.gift_card({})}</h2>
					<div class="mb-4">
						<strong class="mb-2 block text-gray-700">{m.gift_card_description({})}:</strong>
						<p class="rounded-lg bg-gray-100 p-2">{giftCard.description}</p>
					</div>
					<div class="mb-4">
						<strong class="mb-2 block text-gray-700">{m.gift_card_amount({})}:</strong>
						<p class="rounded-lg bg-gray-100 p-2">{giftCard.amount}€</p>
					</div>
					<div class="flex justify-between">
						<button
							class="flex items-center gap-2 rounded bg-blue-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-600"
							onclick={() => handleEdit(giftCard)}
						>
							<Edit class="h-5 w-5" />
							{m.edit({})}
						</button>
						<form action="?/deleteGiftCard" method="POST">
							<input type="hidden" name="giftCardId" value={giftCard.id} />
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
