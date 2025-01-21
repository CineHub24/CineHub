<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import * as m from '$lib/paraglide/messages.js';
	import type { ActionData, PageData } from './$types';
	import { ArrowBigLeft, Tag, Edit, Trash2 } from 'lucide-svelte';

	const { data, form }: { data: PageData; form: ActionData } = $props();
	const { discounts } = data;

	function formatValue(type: string, value: string) {
		if (type === 'percentage') {
			return `-${Math.round(parseFloat(value) * 100)}%`;
		}

		return `-${value}€`;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-800">{m.discount_management({})}</h1>

	{#if form?.error}
		<div class="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{form.error}</div>
	{/if}

	<div class="mb-8 flex flex-wrap gap-4">
		<button
			class="flex items-center gap-2 rounded bg-blue-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-600"
			onclick={() => languageAwareGoto('/admin/pricing')}
		>
			<ArrowBigLeft class="h-5 w-5" />
			{m.back({})}
		</button>
		<button
			class="flex items-center gap-2 rounded bg-green-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-green-600"
			onclick={() => languageAwareGoto('/admin/discounts/create')}
		>
			<Tag class="h-5 w-5" />
			{m.new_discount({})}
		</button>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>{m.discount_name({})}</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>{m.discount_code({})}</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>{m.discount_value({})}</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>{m.expires_at({})}</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>{m.actions({})}</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 bg-white">
				{#each discounts ?? [] as discount}
					<tr class="transition-colors duration-200 hover:bg-gray-50">
						<td class="whitespace-nowrap px-6 py-4">{discount.name}</td>
						<td class="whitespace-nowrap px-6 py-4">{discount.code}</td>
						<td class="whitespace-nowrap px-6 py-4"
							>{formatValue(discount.discountType, discount.value)}</td
						>
						<td class="whitespace-nowrap px-6 py-4">{discount.expiresAt}</td>
						<td class="whitespace-nowrap px-6 py-4">
							<div class="flex space-x-2">
								<button
									class="flex items-center gap-1 text-blue-500 transition-colors duration-200 hover:text-blue-700"
									onclick={() => languageAwareGoto(`/admin/discounts/${discount.id}`)}
								>
									<Edit class="h-4 w-4" />
									{m.edit({})}
								</button>
								<form action="?/delete" method="post">
									<input type="hidden" name="id" value={discount.id} />
									<button
										type="submit"
										class="flex items-center gap-1 text-red-500 transition-colors duration-200 hover:text-red-700"
									>
										<Trash2 class="h-4 w-4" />
										{m.delete_something({})}
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
