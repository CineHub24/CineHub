<script lang="ts">
    export let value = '';
    export let disabled = false;
    export let error = false;
    
    const baseStyles = 'flex h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';
    
    const errorStyles = 'border-red-500 focus-visible:ring-red-500';
    
    $: computedClass = `${baseStyles} ${error ? errorStyles : ''}`;
</script>

<div class="relative">
    <select
        {disabled}
        class={computedClass}
        bind:value
        on:change
        on:focus
        on:blur
        {...$$restProps}
    >
        <slot />
    </select>
    
    <!-- Custom arrow icon -->
    <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            class="text-gray-500"
        >
            <path d="m6 9 6 6 6-6"/>
        </svg>
    </div>
</div>