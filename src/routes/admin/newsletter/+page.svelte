<script lang="ts">
	import { enhance } from '$app/forms';
	import { Mail, Eye, EyeOff, Send, Users } from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let previewMode = true;
	let content = '';
	let subject = '';
	let isSubmitting = false;

	// Function to get preview content with unsubscribe button
	function getPreviewContent() {
		const unsubscribeButton = `
<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-family: Arial, sans-serif; font-size: 14px; color: #64748b;">
    <a href="" style="color: #64748b; text-decoration: underline;">Newsletter abbestellen</a>
</div>
      `;
		return content
			? content + unsubscribeButton
			: '<div class="text-gray-400 text-center mt-20">Vorschau erscheint hier...</div>';
	}

	function togglePreview() {
		previewMode = !previewMode;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
	<div class="mx-auto max-w-6xl">
		<!-- Header Section -->
		<div class="mb-8">
			<h1 class="mb-2 text-4xl font-bold text-gray-900">Newsletter</h1>
			<div class="flex items-center space-x-2 text-gray-600">
				<Users size={20} />
				<span class="text-lg">{data.subscriberCount} aktive Abonnenten</span>
			</div>
		</div>

		<!-- Main Content -->
		<div class="rounded-2xl bg-white p-8 shadow-lg">
			{#if form?.error}
				<div class="mb-6 rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="ml-3">
							<p class="text-sm text-red-700">{form.error}</p>
						</div>
					</div>
				</div>
			{/if}

			{#if form?.success}
				<div class="mb-6 rounded-lg border-l-4 border-green-400 bg-green-50 p-4">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="ml-3">
							<p class="text-sm text-green-700">{form.message}</p>
						</div>
					</div>
				</div>
			{/if}

			<form
				method="POST"
				action="?/sendNewsletter"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
					};
				}}
				class="space-y-6"
			>
				<!-- Subject Input -->
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Mail size={20} class="text-gray-400" />
					</div>
					<input
						type="text"
						id="subject"
						name="subject"
						bind:value={subject}
						placeholder="Newsletter Betreff"
						class="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>

				<!-- Content Editor Container -->
				<div>
					<!-- Editor Header -->
					<div class="mb-2 flex items-center justify-between">
						<label for="content" class="text-sm font-medium text-gray-700">
							Newsletter Inhalt (HTML)
						</label>
						<button
							type="button"
							on:click={togglePreview}
							class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-200"
						>
							{#if previewMode}
								<EyeOff size={16} class="mr-1" />
								Vorschau aus
							{:else}
								<Eye size={16} class="mr-1" />
								Vorschau an
							{/if}
						</button>
					</div>

					<!-- Editor and Preview Grid -->
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<!-- Editor Panel -->
						<div class="relative h-[600px]">
							<textarea
								id="content"
								name="content"
								bind:value={content}
								class="absolute inset-0 h-full w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm transition-all duration-200 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
								placeholder="<div>Ihr Newsletter HTML hier...</div>"
								required
							></textarea>
						</div>

						<!-- Preview Panel -->
						{#if previewMode}
							<div class="h-[600px] rounded-lg border border-gray-200 bg-white">
								<div class="h-full overflow-auto p-6">
									<div class="prose max-w-none">
										{@html getPreviewContent()}
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- Submit Button -->
				<div class="flex justify-end">
					<button
						type="submit"
						disabled={isSubmitting}
						class="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Send size={20} class="mr-2" />
						{isSubmitting ? 'Wird gesendet...' : 'Newsletter versenden'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>

<style>
	.prose {
		scroll-behavior: smooth;
	}

	/* Hide scrollbar for Chrome, Safari and Opera */
	.prose::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbar for IE, Edge and Firefox */
	.prose {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
