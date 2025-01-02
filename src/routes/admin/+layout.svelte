<script lang="ts">
    import AdminSidebar from '$lib/components/AdminSidebar.svelte';
    
    let isMenuExpanded = false;
    let isMouseOverSidebar = false;
    
    function handleMouseLeaveContainer() {
    if (!isMouseOverSidebar) {
    isMenuExpanded = false;
    }
    }
    </script>
    
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
    class="flex bg-gray-100"
    on:mouseleave={handleMouseLeaveContainer}
    >
    <AdminSidebar bind:isMenuExpanded />
    
    <!-- Main Content Area -->
    <div class="flex-1 p-10 overflow-y-auto">
    <slot />
    </div>
    </div>