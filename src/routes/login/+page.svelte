<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	let { form }: { form: ActionData } = $props();

	let errorMessage = $state('');
	if (form?.message) {
		errorMessage = form.message;
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-800 to-gray-600"
>
	<div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
		<div class="mb-6 flex justify-center">
			<img src="/favicon_white_bg.png" alt="Logo" class="h-20 w-20" />
		</div>
		<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">{m.login_to_account({})}</h2>
		<form method="post" action="?/login" class="space-y-4">
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
			<div class="relative">
				<label for="password" class="block text-sm font-medium text-gray-700"
					>{m.password({})}</label
				>
				<input
					type="password"
					id="password"
					name="password"
					required
					class="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
					placeholder={m.enter_password({})}
				/>
			</div>
			<div class="flex justify-between text-sm">
				<a href="/login/reset-password" class="text-indigo-500 hover:underline"
					>{m.forgot_password({})}</a
				>
			</div>
			<!-- Error Message -->
			{#if errorMessage}
				<p class="text-sm text-red-500">{errorMessage}</p>
			{/if}
			<button
				type="submit"
				class="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200"
			>
				{m.login({})}
			</button>
		</form>
		<div class="my-6 flex items-center">
			<hr class="flex-1 border-gray-300" />
			<span class="mx-4 text-sm text-gray-500">{m.or({}).toUpperCase()}</span>
			<hr class="flex-1 border-gray-300" />
		</div>

		<!-- Social Login Buttons -->
		<div class="space-y-4">
			<a
				type="button"
				href="/login/google"
				class="flex w-full items-center justify-center space-x-3 rounded-md border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
			>
				<img src="/google-logo.svg" alt="Google" class="h-5 w-5" />
				<span>{m.login_with_google({})}</span>
			</a>
			<a
				type="button"
				href="login/github"
				class="flex w-full items-center justify-center space-x-3 rounded-md border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
			>
				<img src="/github-logo.svg" alt="GitHub" class="h-5 w-5" />
				<span>{m.login_with_github({})}</span>
			</a>
		</div>

		<div class="mt-6 text-center text-sm text-gray-600">
			{m.no_account({})}
			<a href="/register" class="text-indigo-500 hover:underline">{m.sign_up({})}</a>
		</div>
	</div>
</div>
