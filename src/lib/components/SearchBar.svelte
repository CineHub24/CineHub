<script>
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	let searchValue = '';
	let isExpanded = false;
	let searchbarEl;

	function handleMouseEnter() {
		isExpanded = true;
	}

	function handleMouseLeave() {
		searchValue = '';
		isExpanded = false;
	}

	function handleClickOutside(event) {
		if (searchbarEl && !searchbarEl.contains(event.target) && !searchValue) {
			isExpanded = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div
	bind:this={searchbarEl}
	class="search-container"
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	role="search"
>
	<div class="search-wrapper" class:expanded={isExpanded}>
		<input
			type="text"
			bind:value={searchValue}
			placeholder={isExpanded ? 'Suchen...' : ''}
			class="search-input"
		/>
		<svg
			class="search-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	</div>
</div>

<style>
	.search-container {
		display: flex;
		justify-content: flex-end;
	}

	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		width: 40px;
		transition: all 0.3s ease;
		transform-origin: right;
	}

	.search-wrapper.expanded {
		width: 250px;
	}

	.search-input {
		width: 100%;
		padding: 8px 40px 8px 12px;
		border: 1px solid #ddd;
		border-radius: 20px;
		outline: none;
		font-size: 16px;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.search-wrapper.expanded .search-input {
		opacity: 1;
	}

	.search-icon {
		position: absolute;
		right: 12px;
		cursor: pointer;
		color: #666;
	}

	.search-input:focus {
		border-color: #4a90e2;
	}
</style>
