<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import * as m from '$lib/paraglide/messages.js';
	import { Gift, ShoppingCart, Info } from 'lucide-svelte';

	let giftCards = [
		{ id: 1, value: 25, description: '10% Rabatt' },
		{ id: 2, value: 50, description: '50€ Gutschein' },
		{ id: 3, value: 100, description: '100€ Gutschein' }
	];

	function addToCart(giftCard: (typeof giftCards)[0]) {
		// Implement add to cart logic here
	}

	function goToDetails(giftCard: (typeof giftCards)[0]) {
		// Implement navigation to details page
        console.log('Details')
	}
	function handleCardClick(giftCard: typeof giftCards[0]) {
		goToDetails(giftCard);
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-800">Geschenkgutscheine</h1>

	<div class="mb-8">
		<p class="text-lg text-gray-600">
			Das hier sind alle Geschenkgutscheine
		</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each giftCards as giftCard}
			<div
				role="button"
				tabindex="0"
				class="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
				on:click={() => handleCardClick(giftCard)}
				on:keydown={(e) => e.key === 'Enter' && handleCardClick(giftCard)}
			>
				<div class="mb-4 flex items-center justify-between">
					<Gift class="h-12 w-12 text-blue-500" />
					<span class="text-2xl font-bold text-gray-800">${giftCard.value}</span>
				</div>
				<h2 class="mb-2 text-xl font-semibold text-gray-800">Gutschein</h2>
				<p class="mb-4 text-gray-600">
					{giftCard.description}
				</p>
				<div class="flex items-center justify-end">
					<button
						type="button"
						class="flex items-center rounded-full bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
						on:click|stopPropagation={() => addToCart(giftCard)}
					>
						<ShoppingCart class="mr-2 h-4 w-4" />
						{m.add_to_cart({})}
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>
