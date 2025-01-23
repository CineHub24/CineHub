<script lang="ts">
	import { JSONEditor } from 'svelte-jsoneditor';

	const { data } = $props();
	let logs = $state(data.logs);

	function toggleMetadata(log) {
		log.showMetadata = !log.showMetadata;
		logs = [...logs];
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold text-gray-800">System Logs</h1>

	<div class="overflow-hidden rounded-lg bg-white shadow-md">
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>ID</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>Level</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>Message</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>Timestamp</th
					>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>Actions</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 bg-white">
				{#each logs as log}
					<tr>
						<td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{log.id}</td>
						<td class="whitespace-nowrap px-6 py-4">
							<span
								class="inline-flex rounded-full px-2 text-xs font-semibold leading-5
{log.level.toLowerCase() === 'info'
									? 'bg-green-100 text-green-800'
									: log.level.toLowerCase() === 'warning'
										? 'bg-yellow-100 text-yellow-800'
										: 'bg-red-100 text-red-800'}"
							>
								{log.level}
							</span>
						</td>
						<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{log.message}</td>
						<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
							{log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
						</td>
						<td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
							<button
								on:click={() => toggleMetadata(log)}
								class="text-indigo-600 hover:text-indigo-900"
							>
								{log.showMetadata ? 'Hide' : 'Show'} Metadata
							</button>
						</td>
					</tr>
					{#if log.showMetadata}
						<tr>
							<td colspan="5" class="px-6 py-4">
								<div class="rounded-lg bg-gray-50 p-4">
									<JSONEditor content={{ json: log.metadata }} readOnly={true} />
								</div>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>
