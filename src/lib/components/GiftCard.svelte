<script lang="ts">
	import { Gift, ShoppingCart, Edit, Trash2 } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { derived } from 'svelte/store';
	import { page } from '$app/stores';

	let {
		giftCard,
		isAdminPage
	}: {
		giftCard: {
			id: number;
			description: string | null;
			amount: string;
		};
		isAdminPage: boolean;
	} = $props();
</script>

<div
	role="button"
	tabindex="0"
	class="relative h-full w-full cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
	<div class="p-6">
		<div class="mb-4 flex items-center justify-between">
			<Gift class="h-12 w-12 text-blue-500" />
			<span class="text-2xl font-bold text-gray-800">{giftCard.amount}€</span>
		</div>
		<h2 class="mb-2 text-xl font-semibold text-gray-800">{m.gift_card({})}</h2>
		<p class="mb-4 text-gray-600">
			{giftCard.description}
		</p>
		<form method="POST">
			<input type="hidden" name="giftCardId" value={giftCard.id} />
			<div class="flex items-center justify-end">
				<button
					type="submit"
					formaction="?/addToCart"
					class="flex items-center rounded-full bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
				>
					<ShoppingCart class="mr-2 h-4 w-4" />
					{m.add_to_cart({})}
				</button>
			</div>
		</form>
	</div>
</div>
