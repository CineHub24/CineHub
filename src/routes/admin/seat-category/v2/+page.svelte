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
            path: (w: number, h: number) => `M 0 0 h ${w} v ${h} h -${w} Z`,
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
            `,
        },
        couple: {
            name: 'Love Seat',
            width: 70,
            height: 45,
            path: (w: number, h: number) => `
                M 0 ${h * 0.2}
                Q ${w * 0.2} 0, ${w * 0.5} 0
                Q ${w * 0.8} 0, ${w} ${h * 0.2}
                L ${w} ${h}
                L 0 ${h}
                Z
            `,
        },
        vip: {
            name: 'VIP Recliner',
            width: 50,
            height: 50,
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
            `,
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
            `,
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
            `,
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
    <h2 class="text-xl font-bold mb-4">Existing Categories</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each data.categories as category (category.id)}
            <div 
                class="border rounded-lg p-4 bg-white shadow"
                transition:fade
            >
                <div class="flex justify-between items-start mb-2">
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
                            <button
                                type="submit"
                                class="text-red-500 hover:text-red-700"
                            >
                                Delete
                            </button>
                        </form>
                    </div>
                </div>
                
                <div class="flex items-center gap-4">
                    <svg
                        width={category.width}
                        height={category.height}
                        viewBox="0 0 {category.width} {category.height}"
                    >
                        <path
                            d={category.customPath}
                            fill={category.color}
                            stroke="black"
                            stroke-width="1"
                        />
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
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        transition:fade
        on:click={() => showSuccessPopup = false}
    >
        <div 
            class="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4"
            transition:scale={{ duration: 200 }}
            on:click|stopPropagation
        >
            <div class="text-xl font-semibold mb-2">Success!</div>
            <p class="text-gray-600">
                Seat category "{createdCategory?.name}" has been created successfully.
            </p>
            <button 
                class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                on:click={() => showSuccessPopup = false}
            >
                Close
            </button>
        </div>
    </div>
{/if}


<div class="container mx-auto p-4">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div class="p-6">
            <h1 class="text-2xl font-bold mb-6">Seat Category Editor</h1>

            {#if form?.success}
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Category created successfully!
                </div>
            {/if}

            {#if form?.message}
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {form.message}
                </div>
            {/if}

            <form 
            method="POST"
            action={isEditing ? "?/update" : "?/create"}
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
                    <label class="block text-sm font-medium mb-2">
                        Seat Type
                    </label>
                    <select 
                        name="presetType"
                        value={category.presetType}
                        on:change={handlePresetChange}
                        class="w-full p-2 border rounded-md"
                    >
                        {#each Object.entries(SEAT_PRESETS) as [key, preset]}
                            <option value={key}>{preset.name}</option>
                        {/each}
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        bind:value={category.name}
                        class="w-full p-2 border rounded-md"
                        placeholder="Category name"
                        required
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">
                        Description
                    </label>
                    <input
                        type="text"
                        name="description"
                        bind:value={category.description}
                        class="w-full p-2 border rounded-md"
                        placeholder="Category description"
                    />
                </div>

                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">
                            Color
                        </label>
                        <input
                            type="color"
                            name="color"
                            bind:value={category.color}
                            class="w-full h-10"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">
                            Width (px)
                        </label>
                        <input
                            type="number"
                            name="width"
                            bind:value={category.width}
                            on:input={(e) => updateDimensions('width', e.currentTarget.value)}
                            min="20"
                            class="w-full p-2 border rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">
                            Height (px)
                        </label>
                        <input
                            type="number"
                            name="height"
                            bind:value={category.height}
                            on:input={(e) => updateDimensions('height', e.currentTarget.value)}
                            min="20"
                            class="w-full p-2 border rounded-md"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">
                        Price
                    </label>
                    <input
                        type="number"
                        name="price"
                        bind:value={category.price}
                        step="0.01"
                        min="0"
                        class="w-full p-2 border rounded-md"
                        required
                    />
                </div>

                <!-- Hidden input for customPath -->
                <input type="hidden" name="customPath" value={category.customPath} />

                <div>
                    <label class="block text-sm font-medium mb-2">
                        Preview
                    </label>
                    <div class="border rounded-lg p-4 bg-gray-50">
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

                <div class="flex gap-4">
                    <button 
                        type="submit"
                        class="flex-1 bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
                    </button>
            
                    {#if isEditing}
                        <button 
                            type="button"
                            class="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
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