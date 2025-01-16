<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import * as m from '$lib/paraglide/messages.js';
	import { Tag, Ticket, Banknote, Percent, Gift } from 'lucide-svelte';
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-800">{m.pricing({})}</h1>

	<div class="mb-8">
		<p class="text-lg text-gray-600">
			{m.pricing_description({})}
		</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<button
			type="button"
			class="group relative cursor-pointer overflow-hidden rounded-xl bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			onclick={() => languageAwareGoto('/admin/price-set')}
		>
			<div class="mb-4 flex items-center justify-between">
				<Tag class="h-12 w-12 text-blue-500" />
				<svg
					class="h-6 w-6 transform text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-500"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16l4-4-4-4M8 12h8" />
				</svg>
			</div>
			<h2 class="mb-2 text-xl font-semibold text-gray-800">{m.pricing_sets({})}</h2>
			<p class="text-gray-600">
				{m.price_set_description({})}
			</p>
		</button>

		<button
			type="button"
			class="group relative cursor-pointer overflow-hidden rounded-xl bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			onclick={() => languageAwareGoto('/admin/seat-category')}
		>
			<div class="mb-4 flex items-center justify-between">
				<Banknote class="h-12 w-12 text-green-500" />
				<svg
					class="h-6 w-6 transform text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-green-500"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16l4-4-4-4M8 12h8" />
				</svg>
			</div>
			<h2 class="mb-2 text-xl font-semibold text-gray-800">{m.seat_categories({})}</h2>
			<p class="text-gray-600">
				{m.seat_category_description_pricing({})}
			</p>
		</button>

		<!-- Tickettypen -->
		<button
			type="button"
			class="group relative cursor-pointer overflow-hidden rounded-xl bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			onclick={() => languageAwareGoto('/admin/ticket-type')}
		>
			<div class="mb-4 flex items-center justify-between">
				<Ticket class="h-12 w-12 text-purple-500" />
				<svg
					class="h-6 w-6 transform text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-purple-500"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16l4-4-4-4M8 12h8" />
				</svg>
			</div>
			<h2 class="mb-2 text-xl font-semibold text-gray-800">{m.ticket_types({})}</h2>
			<p class="text-gray-600">
				{m.ticket_type_description_pricing({})}
			</p>
		</button>
		<button
			type="button"
			class="group relative cursor-pointer overflow-hidden rounded-xl bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			onclick={() => languageAwareGoto('/admin/discounts')}
		>
			<div class="mb-4 flex items-center justify-between">
				<Percent class="h-12 w-12 text-yellow-500" />
				<svg
					class="h-6 w-6 transform text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-yellow-500"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16l4-4-4-4M8 12h8" />
				</svg>
			</div>
			<h2 class="mb-2 text-xl font-semibold text-gray-800">{m.discount_codes({})}</h2>
			<p class="text-gray-600">
				{m.discount_codes_description({})}
			</p>
		</button>
		<button
			type="button"
			class="group relative cursor-pointer overflow-hidden rounded-xl bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			onclick={() => languageAwareGoto('/admin/gift-cards')}
		>
			<div class="mb-4 flex items-center justify-between">
				<Gift class="h-12 w-12 text-red-500" />
				<svg
					class="h-6 w-6 transform text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-red-500"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16l4-4-4-4M8 12h8" />
				</svg>
			</div>
			<h2 class="mb-2 text-xl font-semibold text-gray-800">{m.gift_cards({})}</h2>
			<p class="text-gray-600">
				{m.gift_cards_description({})}
			</p>
		</button>
	</div>
</div>
