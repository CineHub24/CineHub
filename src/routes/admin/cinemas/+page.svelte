<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import * as m from '$lib/paraglide/messages.js';

	const { data } = $props();
	const { cinemas } = data;
</script>

<div class="rounded-lg bg-white p-6 shadow">
	<h1 class="mb-4 text-2xl font-bold">{m.cinema_management({})}</h1>
	<div class="mb-4 flex justify-end">
		<button
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			onclick={() => {
				languageAwareGoto('/admin/cinemas/create');
			}}
		>
			{m.new_cinema({})}
		</button>
	</div>
	<div class="overflow-x-auto">
		<table class="w-full border bg-white">
			<thead class="bg-gray-100">
				<tr>
					<th class="p-3 text-left">{m.name({})}</th>
					<th class="p-3 text-left">{m.address({})}</th>
					<th class="p-3 text-left">{m.opens_at({})}</th>
					<th class="p-3 text-left">{m.closes_at({})}</th>
					<th class="p-3 text-left">{m.actions({})}</th>
				</tr>
			</thead>
			<tbody>
				{#each cinemas as cinema}
					<tr class="border-b">
						<td class="p-3">{cinema.name}</td>
						<td class="p-3">{cinema.address}</td>
						<td class="p-3">{cinema.opentime}</td>
						<td class="p-3">{cinema.closeTime}</td>
						<td class="p-3">
							<div class="flex space-x-2">
								<button
									class="text-blue-500 hover:text-blue-700"
									onclick={() => {
										languageAwareGoto(`/admin/cinemas/${cinema.id}`);
									}}>{m.edit({})}</button
								>
								<form action="?/delete" method="post">
									<input type="hidden" name="id" value={cinema.id} />
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
</div>
