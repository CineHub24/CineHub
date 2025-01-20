<script lang="ts">
	export let value = '';
	export let type = 'text';
	export let placeholder = '';
	export let disabled = false;
	export let error = false;

	const baseStyles =
		'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

	const errorStyles = 'border-red-500 focus-visible:ring-red-500';

	$: computedClass = `${baseStyles} ${error ? errorStyles : ''}`;
</script>

<input
	{type}
	{placeholder}
	{disabled}
	class={computedClass}
	bind:value
	on:input
	on:change
	on:focus
	on:blur
	{...$$restProps}
/>
