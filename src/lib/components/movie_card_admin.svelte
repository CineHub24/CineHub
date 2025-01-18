<script lang="ts">
	let { movie } = $props();
	import { languageAwareGoto } from '$lib/utils/languageAware.js';
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="relative h-[290px] w-[200px] cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm"
	onclick={() => languageAwareGoto(`/admin/film/${movie.id}`)}
>
	<img src={movie.poster} alt="{movie.title} Poster" class="h-full w-full object-cover" />
</div>