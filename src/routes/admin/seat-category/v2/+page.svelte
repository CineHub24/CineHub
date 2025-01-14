<!-- src/routes/seat-categories/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, scale } from 'svelte/transition';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';

	export let data: PageData;
	export let form: { success?: boolean; message?: string } | null = null;

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
                M ${w * 0.5} ${h * 0.3}
                A ${w * 0.2} ${h * 0.2} 0 1 1 ${w * 0.5} ${h * 0.31}
                M ${w * 0.3} ${h * 0.6}
                A ${w * 0.4} ${h * 0.4} 0 1 0 ${w * 0.7} ${h * 0.6}
                M ${w * 0.2} ${h}
                L ${w * 0.8} ${h}
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

	export let category = {
		name: '',
		description: '',
		color: '#FF0000',
		width: 40,
		height: 40,
		price: 0,
		customPath: SEAT_PRESETS.regular.path(40, 40),
		presetType: 'regular'
	};

	function handlePresetChange(event: Event) {
		const presetType = (event.target as HTMLSelectElement).value;
		const preset = SEAT_PRESETS[presetType];
		category = {
			...category,
			presetType,
			width: preset.width,
			height: preset.height,
			customPath: preset.path(preset.width, preset.height),
			name: category.name
		};
	}

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

	let isSubmitting = false;
	let showSuccessPopup = false;
	export let createdCategory: any = null;

	function handleSuccess(result: any) {
		isSubmitting = false;
		if (result.type === 'success') {
			createdCategory = result.data.data;
			console.log('Created category:', createdCategory);
			showSuccessPopup = true;
			// Add debug logging

			setTimeout(() => {
				showSuccessPopup = false;
			}, 3000);

			// Reset form
			category = {
				name: '',
				description: '',
				color: '#FF0000',
				width: 40,
				height: 40,
				price: 0,
				customPath: SEAT_PRESETS.regular.path(40, 40),
				presetType: 'regular'
			};
		}
	}
	let isEditing = false;
	let editingId: number | null = null;

	function editCategory(category: any) {
		isEditing = true;
		editingId = category.id;
		// Populate form with category data
		category = {
			name: category.name,
			description: category.description,
			color: category.color,
			width: category.width,
			height: category.height,
			price: category.price,
			customPath: category.customPath,
			presetType: 'regular'
		};

		console.log('Editing category:', category);
	}

	function cancelEdit() {
		isEditing = false;
		editingId = null;
		// Reset form
		category = {
			name: '',
			description: '',
			color: '#FF0000',
			width: 40,
			height: 40,
			price: 0,
			customPath: SEAT_PRESETS.regular.path(40, 40),
			presetType: 'regular'
		};
	}
</script>

<!-- List View -->
<div class="mb-8">
	<h2 class="mb-4 text-xl font-bold">Existing Categories</h2>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each data.categories as category (category.id)}
			<div class="rounded-lg border bg-white p-4 shadow" transition:fade>
				<div class="mb-2 flex items-start justify-between">
					<h3 class="font-semibold">{category.name}</h3>
					<div class="flex gap-2">
						<button
							class="text-blue-500 hover:text-blue-700"
							on:click={() => editCategory(category)}
						>
							Edit
						</button>
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success') {
										// Force a data refresh, re-running +page.server.ts
										await invalidateAll();
									}
								};
							}}
						>
							<input type="hidden" name="id" value={category.id} />
							<button type="submit" class="text-red-500 hover:text-red-700"> Delete </button>
						</form>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<svg
						width={category.width}
						height={category.height}
						viewBox="0 0 {category.width} {category.height}"
					>
						<path d={category.customPath} fill={category.color} stroke="black" stroke-width="1" />
					</svg>
					<div>
						<p class="text-sm text-gray-600">{category.description}</p>
						<p class="text-sm font-medium">${category.price}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if showSuccessPopup}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
		transition:fade
		on:click={() => (showSuccessPopup = false)}
	>
		<div
			class="mx-4 max-w-sm rounded-lg bg-white p-6 shadow-xl"
			transition:scale={{ duration: 200 }}
			on:click|stopPropagation
		>
			<div class="mb-2 text-xl font-semibold">Success!</div>
			<p class="text-gray-600">
				Seat category "{createdCategory?.name}" has been created successfully.
			</p>
			<button
				class="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				on:click={() => (showSuccessPopup = false)}
			>
				Close
			</button>
		</div>
	</div>
{/if}

<div class="container mx-auto p-4">
	<div class="mx-auto max-w-4xl rounded-lg bg-white shadow-md">
		<div class="p-6">
			<h1 class="mb-6 text-2xl font-bold">Seat Category Editor</h1>

			{#if form?.success}
				<div class="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
					Category created successfully!
				</div>
			{/if}

			{#if form?.message}
				<div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
					{form.message}
				</div>
			{/if}

			<form
				method="POST"
				action={isEditing ? '?/update' : '?/create'}
				use:enhance={() => {
					isSubmitting = true;
					return async ({ result }) => {
						if (result.type === 'success') {
							handleSuccess(result);
							if (isEditing) {
								cancelEdit();
							}
							await invalidateAll();
						}
						isSubmitting = false;
					};
				}}
				class="space-y-6"
			>
				{#if isEditing}
					<input type="hidden" name="id" value={editingId} />
				{/if}
				<div>
					<label class="mb-2 block text-sm font-medium"> Seat Type </label>
					<select
						name="presetType"
						value={category.presetType}
						on:change={handlePresetChange}
						class="w-full rounded-md border p-2"
					>
						{#each Object.entries(SEAT_PRESETS) as [key, preset]}
							<option value={key}>{preset.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="mb-2 block text-sm font-medium"> Name </label>
					<input
						type="text"
						name="name"
						bind:value={category.name}
						class="w-full rounded-md border p-2"
						placeholder="Category name"
						required
					/>
				</div>

				<div>
					<label class="mb-2 block text-sm font-medium"> Description </label>
					<input
						type="text"
						name="description"
						bind:value={category.description}
						class="w-full rounded-md border p-2"
						placeholder="Category description"
					/>
				</div>

				<div class="grid grid-cols-3 gap-4">
					<div>
						<label class="mb-2 block text-sm font-medium"> Color </label>
						<input type="color" name="color" bind:value={category.color} class="h-10 w-full" />
					</div>
					<div>
						<label class="mb-2 block text-sm font-medium"> Width (px) </label>
						<input
							type="number"
							name="width"
							bind:value={category.width}
							on:input={(e) => updateDimensions('width', e.currentTarget.value)}
							min="20"
							class="w-full rounded-md border p-2"
							required
						/>
					</div>
					<div>
						<label class="mb-2 block text-sm font-medium"> Height (px) </label>
						<input
							type="number"
							name="height"
							bind:value={category.height}
							on:input={(e) => updateDimensions('height', e.currentTarget.value)}
							min="20"
							class="w-full rounded-md border p-2"
							required
						/>
					</div>
				</div>

				<div>
					<label class="mb-2 block text-sm font-medium"> Price </label>
					<input
						type="number"
						name="price"
						bind:value={category.price}
						step="0.01"
						min="0"
						class="w-full rounded-md border p-2"
						required
					/>
				</div>

				<!-- Hidden input for customPath -->
				<input type="hidden" name="customPath" value={category.customPath} />

				<div>
					<label class="mb-2 block text-sm font-medium"> Preview </label>
					<div class="rounded-lg border bg-gray-50 p-4">
						<svg
							width={category.width}
							height={category.height}
							viewBox="0 0 {category.width} {category.height}"
							class="mx-auto"
						>
							<path d={category.customPath} fill={category.color} stroke="black" stroke-width="1" />
						</svg>
					</div>
				</div>

				<div class="flex gap-4">
					<button
						type="submit"
						class="flex-1 rounded-md bg-blue-500 p-3 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
					</button>

					{#if isEditing}
						<button
							type="button"
							class="rounded-md border border-gray-300 px-6 py-3 hover:bg-gray-50"
							on:click={cancelEdit}
						>
							Cancel
						</button>
					{/if}
				</div>
			</form>
		</div>
	</div>
</div>
