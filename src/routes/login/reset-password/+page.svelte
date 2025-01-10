<script lang="ts">
	import { enhance } from '$app/forms';

	import * as m from '$lib/paraglide/messages.js';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let errorMessage = $state('');
	let successMessage = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let passwordsMatch = $state(true);

	function checkPasswordMatch() {
		passwordsMatch = password === confirmPassword;
	}
</script>

{#if !data.hasToken}
	<div
		class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-800 to-gray-600"
	>
		<div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
			<div class="mb-6 flex justify-center">
				<img src="/favicon_white_bg.png" alt="Logo" class="h-20 w-20" />
			</div>
			<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">{m.forgot_password({})}</h2>
			<p class="mb-6 text-center text-sm text-gray-600">{m.enter_email_reset_password({})}</p>
			<form method="post" action="?/resetPassword" class="space-y-4">
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

				<button
					type="submit"
					class="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200"
				>
					{m.enter_email_reset_password_button({})}
				</button>
			</form>

			<div class="mt-6 text-center text-sm text-gray-600">
				<a href="/login" class="text-indigo-500 hover:underline">{m.back_to_login({})}</a>
			</div>
            {#if form?.success}
                <div class="mt-6 text-center text-sm text-green-500">
                    {form.success}
                </div>
                {/if}
                {#if form?.error}
                <div class="mt-6 text-center text-sm text-red-500">
                    {form.error}
                    </div>
            {/if}
		</div>
	</div>
{:else}
	<div
		class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-800 to-gray-600"
	>
		<div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
			<div class="mb-6 flex justify-center">
				<img src="/favicon_white_bg.png" alt="Logo" class="h-20 w-20" />
			</div>
			<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">{m.set_new_password({})}</h2>
			<p class="mb-6 text-center text-sm text-gray-600">{m.enter_new_password({})}</p>
			<form method="post" action="?/setNewPassword" class="space-y-4" use:enhance>
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700"
						>{m.new_password({})}</label
					>
					<input type="hidden" name="token" value={data.token} />
					<input
						type="password"
						id="password"
						name="password"
						required
						bind:value={password}
						oninput={checkPasswordMatch}
						class="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
						placeholder={m.enter_new_password({})}
					/>
				</div>
				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700"
						>{m.confirm_password({})}</label
					>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						required
						bind:value={confirmPassword}
						oninput={checkPasswordMatch}
						class="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
						placeholder={m.confirm_new_password({})}
					/>
				</div>

				{#if !passwordsMatch}
					<p class="text-sm text-red-500">{m.passwords_do_not_match({})}</p>
				{/if}

				<!-- Error Message -->
				{#if errorMessage}
					<p class="text-sm text-red-500">{errorMessage}</p>
				{/if}

				<!-- Success Message -->
				{#if successMessage}
					<p class="text-sm text-green-500">{successMessage}</p>
				{/if}

				<button
					type="submit"
					class="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200"
					disabled={!passwordsMatch}
				>
					{m.set_new_password_button({})}
				</button>
			</form>

			<div class="mt-6 text-center text-sm text-gray-600">
				<a href="/login" class="text-indigo-500 hover:underline">{m.back_to_login({})}</a>
			</div>
            {#if form?.success}
                <div class="mt-6 text-center text-sm text-green-500">
                    {form.success}
                </div>
                {/if}
                {#if form?.error}
                <div class="mt-6 text-center text-sm text-red-500">
                    {form.error}
                    </div>
            {/if}
		</div>
	</div>
{/if}
