<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import type { PageData, ActionData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { ArrowBigLeft, Tag, Save, Trash2, CircleX, Edit } from 'lucide-svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const { ticketTypes } = data;

	let isCreatingNewTicketType = $state(false);
	let editingTicketTypeId = $state<number | null>(null);

	function cancelEdit() {
		isCreatingNewTicketType = false;
		editingTicketTypeId = null;
	}

	function startNewTicketType() {
		isCreatingNewTicketType = true;
		editingTicketTypeId = null;
	}

	const sortedTicketTypes = ticketTypes!.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0);
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-800">{m.ticket_types_management({})}</h1>

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
		{#if !isCreatingNewTicketType}
			<button
				class="flex items-center gap-2 rounded bg-green-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-green-600"
				onclick={startNewTicketType}
			>
				<Tag class="h-5 w-5" />
				{m.create_new_ticket_type({})}
			</button>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#if isCreatingNewTicketType}
			<div
				class="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				<h2 class="mb-4 text-2xl font-semibold text-gray-800">{m.new_ticket_type({})}</h2>
				<form method="POST" action="?/createTicketType">
					<div class="mb-4">
						<label for="name" class="mb-2 block text-gray-700">{m.ticket_type_name({})}:</label>
						<input
							class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder={m.ticket_type_name({})}
							name="name"
							type="text"
							required
						/>
					</div>
					<div class="mb-4">
						<label for="factor" class="mb-2 block text-gray-700">{m.factor({})}:</label>
						<input
							class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							type="number"
							step="0.01"
							name="factor"
							placeholder={m.ticket_type_factor({})}
							required
						/>
					</div>
					<div class="mb-4">
						<label for="description" class="mb-2 block text-gray-700">{m.description({})}:</label>
						<input
							class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							type="text"
							name="description"
							placeholder={m.ticket_type_description({})}
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
			</div>
		{/if}
		{#each sortedTicketTypes as ticketType}
			<div
				class="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				{#if editingTicketTypeId === ticketType.id}
					<form method="POST" action="?/updateTicketType">
						<input type="hidden" name="id" value={ticketType.id} />
						<div class="mb-4">
							<label for="name" class="mb-2 block text-gray-700">{m.ticket_type_name({})}:</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder={m.ticket_type_name({})}
								name="name"
								type="text"
								value={ticketType.name}
								required
							/>
						</div>
						<div class="mb-4">
							<label for="factor" class="mb-2 block text-gray-700">{m.factor({})}:</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								type="number"
								step="0.01"
								name="factor"
								placeholder={m.ticket_type_factor({})}
								value={ticketType.factor}
								required
							/>
						</div>
						<div class="mb-4">
							<label for="description" class="mb-2 block text-gray-700">{m.description({})}:</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								type="text"
								name="description"
								placeholder={m.ticket_type_description({})}
								value={ticketType.description}
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
					<h2 class="mb-4 text-2xl font-semibold text-gray-800">{ticketType.name}</h2>
					<div class="mb-4 rounded-lg bg-gray-100 p-2">
						{m.factor({})}: {Math.round(parseFloat(ticketType.factor ?? '1.0') * 100)}%
					</div>
					<div class="mb-4 rounded-lg bg-gray-100 p-2">
						{m.description({})}: {ticketType.description}
					</div>
					<div class="flex justify-between">
						<button
							class="flex items-center gap-2 rounded bg-blue-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-600"
							onclick={() => (editingTicketTypeId = ticketType.id)}
						>
							<Edit class="h-5 w-5" />
							{m.edit({})}
						</button>
						<form method="POST" action="?/deleteTicketType">
							<input type="hidden" name="id" value={ticketType.id} />
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
