<script lang="ts">
	import ProfileSidebar from '$lib/components/ProfileSidebar.svelte';

	let isMenuExpanded = false;
	let isMouseOverSidebar = false;

	function handleMouseLeaveContainer() {
		if (!isMouseOverSidebar) {
			isMenuExpanded = false;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex bg-gray-100" on:mouseleave={handleMouseLeaveContainer}>
	<ProfileSidebar bind:isMenuExpanded />

	<!-- Main Content Area -->
	<div class="flex-1 overflow-y-auto p-10">
		<slot />
	</div>
</div>
