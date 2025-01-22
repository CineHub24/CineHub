<script lang="ts">
	// --- Imports & Types ---
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
	import type { PageData, ActionData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { ArrowBigLeft, Tag, Save, Trash2, CircleX, Edit } from 'lucide-svelte';

	// --- Props & Data ---
	let { data, form }: { data: PageData; form: ActionData } = $props();
	const seatCategories = data.categories;

	// --- Seat Presets ---
	const SEAT_PRESETS = {
		regular: {
			name: 'Regular Seat',
			width: 40,
			height: 40,
			path: (w: number, h: number) => `M 0 0 h ${w} v ${h} h -${w} Z`
		},
		couch: {
			name: 'Couch (2 Seats)',
			width: 80,
			height: 40,
			path: (w: number, h: number) => `
          M 0 ${h * 0.1} 
          C 0 0, ${w * 0.2} 0, ${w * 0.25} ${h * 0.1}
          L ${w * 0.75} ${h * 0.1}
          C ${w * 0.8} 0, ${w} 0, ${w} ${h * 0.1}
          L ${w} ${h}
          L 0 ${h}
          Z
        `
		},
		couple: {
			name: 'Love Seat',
			width: 70,
			height: 40,
			path: (w: number, h: number) => `
          M 0 ${h * 0.2}
          Q ${w * 0.2} 0, ${w * 0.5} 0
          Q ${w * 0.8} 0, ${w} ${h * 0.2}
          L ${w} ${h}
          L 0 ${h}
          Z
        `
		},
		vip: {
			name: 'VIP Recliner',
			width: 50,
			height: 40,
			path: (w: number, h: number) => `
          M ${w * 0.1} ${h * 0.1}
          Q ${w * 0.5} 0, ${w * 0.9} ${h * 0.1}
          L ${w} ${h}
          L 0 ${h}
          Z
          M ${w * 0.2} ${h * 0.3}
          L ${w * 0.8} ${h * 0.3}
          M ${w * 0.2} ${h * 0.5}
          L ${w * 0.8} ${h * 0.5}
        `
		},
		wheelchair: {
			name: 'Wheelchair Space',
			width: 60,
			height: 60,
			path: (w: number, h: number) => `
			M ${w * 0.3} ${h * 0.2} 
			A ${w * 0.1} ${h * 0.1} 0 1 1 ${w * 0.4} ${h * 0.2} 
			M ${w * 0.35} ${h * 0.3} 
			L ${w * 0.35} ${h * 0.5} 
			L ${w * 0.55} ${h * 0.6} 
			M ${w * 0.35} ${h * 0.5} 
			L ${w * 0.4} ${h * 0.7} 
			M ${w * 0.4} ${h * 0.7} 
			A ${w * 0.25} ${h * 0.25} 0 1 1 ${w * 0.4} ${h * 0.71} 
			M ${w * 0.6} ${h * 0.7} 
			L ${w * 0.8} ${h * 0.9}
		`
		},
		bean: {
			name: 'Bean Bag',
			width: 45,
			height: 45,
			path: (w: number, h: number) => `
          M ${w * 0.2} ${h * 0.1}
          Q ${w * 0.5} 0, ${w * 0.8} ${h * 0.1}
          Q ${w} ${h * 0.4}, ${w * 0.9} ${h * 0.8}
          Q ${w * 0.5} ${h}, ${w * 0.1} ${h * 0.8}
          Q 0 ${h * 0.4}, ${w * 0.2} ${h * 0.1}
        `
		}
	};

	// --- Local States ---
	let isCreatingNewSeatCategory = $state(false);
	let editingSeatCategoryId = $state<number | null>(null);
	let isSubmitting = false;
	let showSuccessPopup = false;

	// New category state (for creation)
	let category = $state({
		name: '',
		description: '',
		color: '#FF0000',
		width: SEAT_PRESETS.regular.width,
		height: SEAT_PRESETS.regular.height,
		price: 0,
		customPath: SEAT_PRESETS.regular.path(SEAT_PRESETS.regular.width, SEAT_PRESETS.regular.height),
		presetType: 'regular'
	});

	// Editing category state
	let editingCategory = $state({
		name: '',
		description: '',
		color: '#FF0000',
		width: SEAT_PRESETS.regular.width,
		height: SEAT_PRESETS.regular.height,
		price: 0,
		customPath: SEAT_PRESETS.regular.path(SEAT_PRESETS.regular.width, SEAT_PRESETS.regular.height),
		presetType: 'regular'
	});

	// --- Helper Functions ---
	// Reset the editing state
	function resetEditingState() {
		isCreatingNewSeatCategory = false;
		editingSeatCategoryId = null;
		editingCategory = {
			name: '',
			description: '',
			color: '#FF0000',
			width: SEAT_PRESETS.regular.width,
			height: SEAT_PRESETS.regular.height,
			price: 0,
			customPath: SEAT_PRESETS.regular.path(
				SEAT_PRESETS.regular.width,
				SEAT_PRESETS.regular.height
			),
			presetType: 'regular'
		};
	}

	// Reset the create state
	function resetCategoryState() {
		category = {
			name: '',
			description: '',
			color: '#FF0000',
			width: SEAT_PRESETS.regular.width,
			height: SEAT_PRESETS.regular.height,
			price: 0,
			customPath: SEAT_PRESETS.regular.path(
				SEAT_PRESETS.regular.width,
				SEAT_PRESETS.regular.height
			),
			presetType: 'regular'
		};
	}

	// For creation form: update dimensions and re-generate the customPath.
	function updateDimensions(dimension: 'width' | 'height', value: string) {
		const newValue = parseInt(value);
		if (isNaN(newValue) || newValue < 20) return;

		const preset = SEAT_PRESETS[category.presetType];
		category = {
			...category,
			[dimension]: newValue,
			customPath: preset.path(
				dimension === 'width' ? newValue : category.width,
				dimension === 'height' ? newValue : category.height
			)
		};
	}

	// For editing form: update dimensions and re-generate the customPath.
	function updateEditingDimensions(dimension: 'width' | 'height', value: string) {
		const newValue = parseInt(value);
		if (isNaN(newValue) || newValue < 20) return;
		const preset = SEAT_PRESETS[editingCategory.presetType];
		editingCategory = {
			...editingCategory,
			[dimension]: newValue,
			customPath: preset.path(
				dimension === 'width' ? newValue : editingCategory.width,
				dimension === 'height' ? newValue : editingCategory.height
			)
		};
	}

	function handlePresetChange(event: Event) {
		const presetType = (event.target as HTMLSelectElement).value;
		const preset = SEAT_PRESETS[presetType];

		const newPath = preset.path(preset.width, preset.height);

		category = {
			...category,
			presetType,
			width: preset.width,
			height: preset.height,
			customPath: newPath
		};
	}

	// Handle preset change for editing form
	function handleEditingPresetChange(event: Event) {
		const presetType = (event.target as HTMLSelectElement).value;
		const preset = SEAT_PRESETS[presetType];
		editingCategory = {
			...editingCategory,
			presetType,
			width: preset.width,
			height: preset.height,
			customPath: preset.path(preset.width, preset.height)
		};
	}

	// Start editing an existing seat category
	function startEditing(seatCategory) {
		editingSeatCategoryId = seatCategory.id;
		// Determine the preset type by matching the current customPath with presets
		const presetType =
			Object.entries(SEAT_PRESETS).find(
				([, preset]) =>
					preset.path(seatCategory.width, seatCategory.height) === seatCategory.customPath
			)?.[0] || 'regular';

		editingCategory = {
			...seatCategory,
			presetType
		};
	}

	// Cancel editing or creation
	function cancelEdit(event?: Event) {
		if (event) event.preventDefault();
		resetEditingState();
		resetCategoryState();
	}

	// For handling a successful server response
	function handleSuccess(result: any) {
		isSubmitting = false;
		if (result.type === 'success') {
			showSuccessPopup = true;
			setTimeout(() => {
				showSuccessPopup = false;
			}, 3000);
			resetCategoryState();
		}
	}

	// Computed: Sorted seat categories (alphabetically)
	const sortedSeatCategories = [...seatCategories].sort(
		(a, b) => a.name?.localeCompare(b.name ?? '') ?? 0
	);

	$effect(() => {
		if (isCreatingNewSeatCategory) {
			const preset = SEAT_PRESETS[category.presetType];
			category.customPath = preset.path(category.width, category.height);
		}
	});
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-800">
		{m.seat_categories_management({})}
	</h1>

	{#if form}
		<div class="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
			{form.message}
		</div>
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
				onclick={() => (isCreatingNewSeatCategory = true)}
			>
				<Tag class="h-5 w-5" />
				{m.create_new_seat_category({})}
			</button>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#if isCreatingNewSeatCategory}
			<!-- New Seat Category Form -->
			<div
				class="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				<h2 class="mb-4 text-2xl font-semibold text-gray-800">
					{m.new_seat_category({})}
				</h2>
				<form method="POST" action="?/create">
					<div>
						<label class="mb-2 block text-sm font-medium">Seat Type</label>
						<select
							name="presetType"
							value={category.presetType}
							onchange={handlePresetChange}
							class="w-full rounded-md border p-2"
						>
							{#each Object.entries(SEAT_PRESETS) as [key, preset]}
								<option value={key}>{preset.name}</option>
							{/each}
						</select>
					</div>
					<div class="mb-4">
						<label for="name" class="mb-2 block text-gray-700">
							{m.seat_category_name({})}:
						</label>
						<input
							class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							placeholder={m.seat_category_name({})}
							name="name"
							type="text"
							required
						/>
					</div>
					<div class="mb-4">
						<label for="price" class="mb-2 block text-gray-700">
							{m.price({})}:
						</label>
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
						<label for="description" class="mb-2 block text-gray-700">
							{m.description({})}:
						</label>
						<input
							class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							type="text"
							name="description"
							placeholder={m.seat_category_description({})}
						/>
					</div>
					<div class="grid grid-cols-3 gap-4">
						<div>
							<label class="mb-2 block text-sm font-medium">Color</label>
							<input
								type="color"
								name="color"
								value={category.color}
								onchange={(e) => (category = { ...category, color: e.target.value })}
								class="h-10 w-full"
							/>
						</div>
						<div>
							<label class="mb-2 block text-sm font-medium">Width (px)</label>
							<input
								type="number"
								name="width"
								value={category.width}
								onchange={(e) => updateDimensions('width', e.target.value)}
								min="20"
								class="w-full rounded-md border p-2"
								required
							/>
						</div>
						<div>
							<label class="mb-2 block text-sm font-medium">Height (px)</label>
							<input
								type="number"
								name="height"
								value={category.height}
								onchange={(e) => updateDimensions('height', e.target.value)}
								min="20"
								class="w-full rounded-md border p-2"
								required
							/>
						</div>
					</div>

					<!-- SVG Preview -->
					<div class="col-span-3">
						<label class="mb-2 block text-sm font-medium">Preview</label>
						<div class="rounded-lg border bg-gray-50 p-4">
							<svg
								width={category.width}
								height={category.height}
								viewBox="0 0 {category.width} {category.height}"
								class="mx-auto"
							>
								<path
									d={category.customPath}
									fill={category.color}
									stroke="black"
									stroke-width="1"
								/>
							</svg>
						</div>
					</div>

					<input type="hidden" name="customPath" value={category.customPath} />
					<div class="mt-4 flex justify-between">
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
					<!-- Editing Form -->
					<form method="POST" action="?/update">
						<div>
							<label class="mb-2 block text-sm font-medium">Seat Type</label>
							<select
								name="presetType"
								value={editingCategory.presetType}
								onchange={handleEditingPresetChange}
								class="w-full rounded-md border p-2"
							>
								{#each Object.entries(SEAT_PRESETS) as [key, preset]}
									<option value={key}>{preset.name}</option>
								{/each}
							</select>
						</div>
						<input type="hidden" name="id" value={seatCategory.id} />
						<div class="mb-4">
							<label for="name" class="mb-2 block text-gray-700">
								{m.seat_category_name({})}:
							</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder={m.seat_category_name({})}
								name="name"
								type="text"
								bind:value={editingCategory.name}
								required
							/>
						</div>
						<div class="mb-4">
							<label for="price" class="mb-2 block text-gray-700">
								{m.price({})}:
							</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								type="number"
								step="0.01"
								name="price"
								placeholder={m.seat_category_price({})}
								bind:value={editingCategory.price}
								required
							/>
						</div>
						<div class="mb-4">
							<label for="description" class="mb-2 block text-gray-700">
								{m.description({})}:
							</label>
							<input
								class="w-full rounded-lg border-2 border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
								type="text"
								name="description"
								placeholder={m.seat_category_description({})}
								bind:value={editingCategory.description}
							/>
						</div>
						<div class="grid grid-cols-3 gap-4">
							<div>
								<label class="mb-2 block text-sm font-medium">Color</label>
								<input
									type="color"
									name="color"
									bind:value={editingCategory.color}
									class="h-10 w-full"
								/>
							</div>
							<div>
								<label class="mb-2 block text-sm font-medium">Width (px)</label>
								<input
									type="number"
									name="width"
									bind:value={editingCategory.width}
									oninput={(e) => updateEditingDimensions('width', e.currentTarget.value)}
									min="20"
									class="w-full rounded-md border p-2"
									required
								/>
							</div>
							<div>
								<label class="mb-2 block text-sm font-medium">Height (px)</label>
								<input
									type="number"
									name="height"
									bind:value={editingCategory.height}
									oninput={(e) => updateEditingDimensions('height', e.currentTarget.value)}
									min="20"
									class="w-full rounded-md border p-2"
									required
								/>
							</div>
							<div class="col-span-3">
								<label class="mb-2 block text-sm font-medium">Preview</label>
								<div class="rounded-lg border bg-gray-50 p-4">
									<svg
										width={editingCategory.width}
										height={editingCategory.height}
										viewBox="0 0 {editingCategory.width} {editingCategory.height}"
										class="mx-auto"
									>
										<path
											d={editingCategory.customPath}
											fill={editingCategory.color}
											stroke="black"
											stroke-width="1"
										/>
									</svg>
								</div>
							</div>
						</div>
						<input type="hidden" name="customPath" value={editingCategory.customPath} />
						<div class="mt-4 flex justify-between">
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
					<!-- Standard Display of Seat Category -->
					<h2 class="mb-4 text-2xl font-semibold text-gray-800">{seatCategory.name}</h2>
					<div class="mb-4 rounded-lg bg-gray-100 p-2">
						{m.price({})}: {parseFloat(seatCategory.price ?? '0').toFixed(2)}€
					</div>
					<div class="mb-4 rounded-lg bg-gray-100 p-2">
						{m.description({})}: {seatCategory.description}
					</div>

					<!-- SVG Preview in Standard Display -->
					<div class="mb-4 rounded-lg border bg-gray-50 p-4">
						<svg
							width={seatCategory.width}
							height={seatCategory.height}
							viewBox="0 0 {seatCategory.width} {seatCategory.height}"
							class="mx-auto"
						>
							<path
								d={seatCategory.customPath}
								fill={seatCategory.color}
								stroke="black"
								stroke-width="1"
							/>
						</svg>
					</div>
					<div class="flex justify-between">
						<button
							class="flex items-center gap-2 rounded bg-blue-500 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-600"
							onclick={() => startEditing(seatCategory)}
						>
							<Edit class="h-5 w-5" />
							{m.edit({})}
						</button>
						<form method="POST" action="?/delete">
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
