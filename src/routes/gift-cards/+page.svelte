<script lang="ts">
	import type { ActionData, PageData } from '../$types';
	import GiftCard from '$lib/components/GiftCard.svelte';

	const { data, form }: { data: PageData; form: ActionData } = $props();
	const { codes } = data;

</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-800">Geschenkgutscheine</h1>

	<div class="mb-8">
		<p class="text-lg text-gray-600">Das hier sind alle Geschenkgutscheine</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each codes as giftCard}
			<GiftCard giftCard={giftCard} isAdminPage={false} />
		{/each}
	</div>
</div>
