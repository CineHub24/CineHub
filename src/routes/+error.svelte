<script>
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages.js';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8 text-center">
		<!-- Error Illustration bleibt unverändert -->

		<div class="space-y-6">
			<h1 class="text-4xl font-bold text-gray-900">
				{#if $page.error?.message}
					{$page.error.message}
				{:else if $page.status === 404}
					{m.page_not_found({})}
				{:else}
					{m.error_occurred({})}
				{/if}
			</h1>

			<p class="text-lg text-gray-600">
				{#if $page.status === 404}
					{m.page_not_found_message({})}
				{:else}
					{m.general_error_message({})}
				{/if}
			</p>

			<!-- Error Details (only in dev) bleibt unverändert -->

			<div class="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
				<button
					class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					on:click={() => history.back()}
				>
					{m.go_back({})}
				</button>

				<a
					href="/"
					class="inline-flex items-center rounded-md border border-transparent bg-white px-6 py-3 text-base font-medium text-blue-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					{m.to_homepage({})}
				</a>
			</div>
		</div>

		<div class="mt-8 text-sm text-gray-500">
			<p>
				{m.persistent_problem_message({})}
				<a href="/about-us" class="text-blue-600 hover:text-blue-500">
					{m.contact_us({})}
				</a>
				{m.please({})}
			</p>
		</div>
	</div>
</div>
