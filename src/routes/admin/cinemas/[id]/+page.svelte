<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import GoogleAutocomplete from '$lib/components/GoogleAutocomplete.svelte';
	import type { ActionData, PageData, PageServerData, PageServerLoad } from './$types';

	const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	const { data, form }: { data: PageData; form: ActionData } = $props();
	const { cinema } = data;
	let adress = $state(cinema.address as string);

	function handlePlaceSelected(event) {
		const adresse = event.detail;
		adress = adresse.formatted_address;
		console.log(m.selected_address({}), adresse);
	}
</script>

<div class="form-container">
	<form action="?/update" method="POST" class="styled-form">
		<div class="form-columns">
			<div class="form-column">
				<div class="form-group">
					<label for="name">{m.name({})}</label>
					<input type="text" id="name" name="name" bind:value={cinema.name} required />
				</div>

				<div class="form-group">
					<label for="address">{m.address({})}</label>
					<GoogleAutocomplete
						apiKey={API_KEY}
						placeholder={m.search_address({})}
						{adress}
						on:place-selected={handlePlaceSelected}
					/>
					<input type="hidden" name="adress" value={adress} />
					<input type="hidden" name="id" value={cinema.id} />
				</div>
			</div>

			<div class="form-column">
				<div class="form-group">
					<label for="opening_time">{m.opening_time({})}</label>
					<input
						type="time"
						id="opening_time"
						name="opening_time"
						bind:value={cinema.opentime}
						required
					/>
				</div>

				<div class="form-group">
					<label for="closing_time">{m.closing_time({})}</label>
					<input
						type="time"
						id="closing_time"
						name="closing_time"
						bind:value={cinema.closeTime}
						required
					/>
				</div>
			</div>
		</div>

		<div class="form-actions">
			<button type="submit">{m.save({})}</button>
		</div>
	</form>
	{#if form?.error}
		<div class="mb-4 rounded bg-red-100 p-4 text-red-700">
			{form.error}
		</div>
	{:else if form?.success}
		<div class="mb-4 rounded bg-green-100 p-4 text-green-700">
			{form.success}
		</div>
	{/if}
</div>

<style>
	.form-container {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		background-color: white;
		padding: 40px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
	}

	.styled-form {
		width: 100%;
	}

	.form-columns {
		display: flex;
		gap: 30px;
	}

	.form-column {
		flex: 1;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
		color: #333;
	}

	.form-group input {
		width: 100%;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1em;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 30px;
	}

	.form-actions button {
		padding: 12px 25px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: 0.3s ease;
	}

	.form-actions button:hover {
		background-color: #0056b3;
	}
</style>
