<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import * as m from '$lib/paraglide/messages.js';
	import type { ActionData, PageData } from './$types';

	const { data, form }: {data: PageData, form:ActionData} = $props();
    const { discounts } = data;

</script>

<div class="rounded-lg bg-white p-6 shadow">
	<div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold">{m.discount_management({})}</h1>
        <button 
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
            onclick={() => languageAwareGoto('/admin/discounts/create')}
        >
            {m.new_discount({})}
        </button>
    </div>
	<div class="overflow-x-auto">
		<table class="w-full border bg-white">
			<thead class="bg-gray-100">
				<tr>
					<th class="p-3 text-left">{m.discount_name({})}</th>
					<th class="p-3 text-left">{m.discount_code({})}</th>
					<th class="p-3 text-left">{m.discount_value({})}</th>
					<th class="p-3 text-left">{m.expires_at({})}</th>
					<th class="p-3 text-left">{m.actions({})}</th>
					
				</tr>
			</thead>
			<tbody>
				{#each discounts ?? [] as discount}
					<tr class="border-b">
						<td class="p-3"></td>
						<td class="p-3">{discount.code}</td>
						<td class="p-3">{discount.value}</td>
						<td class="p-3">{discount.expiresAt}</td>
						<td class="p-3">
							<div class="flex space-x-2">
								<button
									class="text-blue-500 hover:text-blue-700"
									onclick={() => {
										languageAwareGoto(`/admin/cinemas/${discount.id}`);
									}}>{m.edit({})}</button
								>
								<form action="?/delete" method="post">
									<input type="hidden" name="id" value={discount.id} />
									<button type="submit" class="text-red-500 hover:text-red-700"
										>{m.delete_something({})}</button
									>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
   {#if form?.error}
        <div class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">{form.error}</span>
            </div>
    {/if} 
</div>
