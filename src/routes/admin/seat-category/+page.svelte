<script lang="ts">
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import type { PageData, ActionData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { ArrowBigLeft, Tag, Save, Trash2, CircleX, Edit } from 'lucide-svelte';

	let { data, form }: { data: PageData, form: ActionData } = $props();

	const { seatCategories } = data;

	let isCreatingNewSeatCategory = $state(false);
	let editingSeatCategoryId = $state<number | null>(null);

	function cancelEdit() {
		isCreatingNewSeatCategory = false;
		editingSeatCategoryId = null;
	}

	function startNewSeatCategory() {
		isCreatingNewSeatCategory = true;
		editingSeatCategoryId = null;
	}

	// Sort seat categories
	const sortedSeatCategories = seatCategories.toSorted((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0);
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-800">{m.seat_categories_management({})}</h1>

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
		{#if !isCreatingNewSeatCategory}
			<button
				class="flex items-center gap-2 rounded bg-green-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-green-600"
				onclick={startNewSeatCategory}
			>
				<Tag class="h-5 w-5" />
				{m.create_new_seat_category({})}
			</button>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#if isCreatingNewSeatCategory}
			<div
				class="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				<h2 class="mb-4 text-2xl font-semibold text-gray-800">{m.new_seat_category({})}</h2>
				<form method="POST" action="?/createSeatCategory">
					<div class="mb-4">
						<label for="name" class="mb-2 block text-gray-700">{m.seat_category_name({})}:</label>
						<input
							class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder={m.seat_category_name({})}
							name="name"
							type="text"
							required
						/>
					</div>
					<div class="mb-4">
						<label for="price" class="mb-2 block text-gray-700">{m.price({})}:</label>
						<input
							class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							type="number"
							step="0.01"
							name="price"
							placeholder={m.seat_category_price({})}
							required
						/>
					</div>
					<div class="mb-4">
						<label for="description" class="mb-2 block text-gray-700">{m.description({})}:</label>
						<input
							class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							type="text"
							name="description"
							placeholder={m.seat_category_description({})}
						/>
					</div>
					<div class="mb-4">
						<label for="emoji" class="mb-2 block text-gray-700">{m.emoji({})}:</label>
						<input
							class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							type="text"
							name="emoji"
							placeholder={m.emoji({})}
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
		{#each sortedSeatCategories as seatCategory}
			<div
				class="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				{#if editingSeatCategoryId === seatCategory.id}
					<form method="POST" action="?/updateSeatCategory">
						<input type="hidden" name="id" value={seatCategory.id} />
						<div class="mb-4">
							<label for="name" class="mb-2 block text-gray-700">{m.seat_category_name({})}:</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder={m.seat_category_name({})}
								name="name"
								type="text"
								value={seatCategory.name}
								required
							/>
						</div>
						<div class="mb-4">
							<label for="price" class="mb-2 block text-gray-700">{m.price({})}:</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								type="number"
								step="0.01"
								name="price"
								placeholder={m.seat_category_price({})}
								value={seatCategory.price}
								required
							/>
						</div>
						<div class="mb-4">
							<label for="description" class="mb-2 block text-gray-700">{m.description({})}:</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								type="text"
								name="description"
								placeholder={m.seat_category_description({})}
								value={seatCategory.description}
							/>
						</div>
						<div class="mb-4">
							<label for="emoji" class="mb-2 block text-gray-700">{m.emoji({})}:</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								type="text"
								name="emoji"
								placeholder={m.emoji({})}
								value={seatCategory.emoji}
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
					<h2 class="mb-4 text-2xl font-semibold text-gray-800">{seatCategory.name}</h2>
					<div class="mb-4 rounded-lg bg-gray-100 p-2">
						{m.price({})}: {parseFloat(seatCategory.price ?? '0').toFixed(2)}€
					</div>
					<div class="mb-4 rounded-lg bg-gray-100 p-2">
						{m.description({})}: {seatCategory.description}
					</div>
					<div class="mb-4 rounded-lg bg-gray-100 p-2">
						{m.emoji({})}: {seatCategory.emoji}
					</div>
					<div class="flex justify-between">
						<button
							class="flex items-center gap-2 rounded bg-blue-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-600"
							onclick={() => (editingSeatCategoryId = seatCategory.id)}
						>
							<Edit class="h-5 w-5" />
							{m.edit({})}
						</button>
						<form method="POST" action="?/deleteSeatCategory">
							<input type="hidden" name="id" value={seatCategory.id} />
							{#if seatCategory.id != 0}
								<button
									class="flex items-center gap-2 rounded bg-red-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-red-600"
									type="submit"
								>
									<Trash2 class="h-5 w-5" />
									{m.delete_something({})}
								</button>
							{/if}
						</form>
					</div>
					{#if seatCategory.id == 0}
						<div class="mt-4 rounded-lg bg-yellow-100 p-2 text-yellow-800">
							{m.cannot_remove_seat_category({})}
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
</div>
