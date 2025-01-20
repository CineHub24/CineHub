<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	let { form }: { form: ActionData } = $props();

	// Reactive variables for passwords
	let password = $state('');
	let confirmPassword = $state('');
	let errorMessage = $state('');
	if (form?.message) {
		errorMessage = form.message;
	}

	// Function to validate if passwords match
	function validatePasswords() {
		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return false;
		}
		errorMessage = '';
		return true;
	}

	function handleSubmit(event: Event) {
		if (!validatePasswords()) {
			event.preventDefault(); // Prevent form submission if validation fails
		}
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-800 to-gray-600"
>
	<div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
		<div class="mb-6 flex justify-center">
			<img src="/favicon_white_bg.png" alt="Logo" class="h-20 w-20" />
		</div>
		<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">{m.register_new({})}</h2>
		<form method="post" action="?/register" class="space-y-4" onsubmit={handleSubmit}>
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700"
					>{m.email_address({})}</label
				>
				<input
					type="email"
					id="email"
					name="email"
					required
					class="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
					placeholder={m.enter_email({})}
				/>
			</div>
			<div>
				<label for="password" class="block text-sm font-medium text-gray-700"
					>{m.password({})}</label
				>
				<input
					type="password"
					id="password"
					name="password"
					bind:value={password}
					required
					class="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
					placeholder={m.enter_password({})}
				/>
			</div>
			<div>
				<label for="confirm-password" class="block text-sm font-medium text-gray-700"
					>{m.password_confirm({})}</label
				>
				<input
					type="password"
					id="confirm-password"
					name="confirm-password"
					bind:value={confirmPassword}
					required
					class="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
					placeholder={m.enter_password_confirm({})}
				/>
			</div>

			<!-- Error Message -->
			{#if errorMessage}
				<p class="text-sm text-red-500">{errorMessage}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200"
			>
				{m.sign_up({})}
			</button>
		</form>

		<div class="mt-6 text-center text-sm text-gray-600">
			{m.already_account({})}
			<a href="/login" class="text-indigo-500 hover:underline">{m.login({})}</a>
		</div>
	</div>
</div>
