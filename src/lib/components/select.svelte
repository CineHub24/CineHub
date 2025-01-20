<script lang="ts">
	export let value = '';
	export let disabled = false;
	export let error = false;

	const baseStyles =
		'flex h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

	const errorStyles = 'border-red-500 focus-visible:ring-red-500';

	$: computedClass = `${baseStyles} ${error ? errorStyles : ''}`;
</script>

<div class="relative">
	<select {disabled} class={computedClass} bind:value on:change on:focus on:blur {...$$restProps}>
		<slot />
	</select>
</div>
