<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import * as m from '$lib/paraglide/messages.js';
	import { Save, ArrowBigLeft } from 'lucide-svelte';

	let discountType = $state('percentage');
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-800">{m.create_discount({})}</h1>

	<div class="mb-8 flex flex-wrap gap-4">
		<button
			class="flex items-center gap-2 rounded bg-blue-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-600"
			onclick={() => languageAwareGoto('/admin/discounts')}
		>
			<ArrowBigLeft class="h-5 w-5" />
			{m.back({})}
		</button>
	</div>

	<div class="rounded-xl bg-white p-6 shadow-md">
		<form action="?/create" method="post" class="space-y-4">
			<div>
				<label for="name" class="mb-2 block text-gray-700">{m.discount_name({})}</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
					placeholder={m.enter_discount_name({})}
				/>
			</div>

			<div>
				<label for="code" class="mb-2 block text-gray-700">{m.discount_code({})}</label>
				<input
					type="text"
					id="code"
					name="code"
					required
					class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
					placeholder={m.enter_discount_code({})}
				/>
			</div>

			<div>
				<label for="type" class="mb-2 block text-gray-700">{m.discount_type({})}</label>
				<select
					id="type"
					name="type"
					required
					bind:value={discountType}
					class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
				>
					<option value="percentage">{m.percentage({})}</option>
					<option value="fixed">{m.fixed_amount({})}</option>
				</select>
			</div>

			<div>
				<label for="discount" class="mb-2 block text-gray-700">{m.discount_value({})}</label>
				<div class="relative">
					<input
						type="number"
						id="discount"
						name="discount"
						required
						min="0"
						step={discountType === 'percentage' ? '0.01' : '1'}
						class="w-full rounded-lg border-2 border-blue-300 p-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400"
						placeholder={discountType === 'percentage'
							? m.enter_percentage({})
							: m.enter_amount({})}
					/>
					<span class="absolute right-3 top-2 text-gray-500">
						{discountType === 'percentage' ? '%' : '€'}
					</span>
				</div>
			</div>

			<div>
				<label for="expires" class="mb-2 block text-gray-700">{m.expiration_date({})}</label>
				<input
					type="date"
					id="expires"
					name="expires"
					required
					class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
				/>
			</div>

			<button
				type="submit"
				class="flex items-center gap-2 rounded bg-green-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-green-600"
			>
				<Save class="h-5 w-5" />
				{m.create_discount({})}
			</button>
		</form>
	</div>
</div>
