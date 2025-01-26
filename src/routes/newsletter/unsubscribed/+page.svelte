<!-- src/routes/newsletter/unsubscribed/+page.svelte -->
<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4"
>
	<div class="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
		<svg
			class="mx-auto mb-4 h-16 w-16 text-green-500"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
			></path>
		</svg>

		<h1 class="mb-4 text-2xl font-bold text-gray-900">Erfolgreich abgemeldet</h1>

		<p class="mb-6 text-gray-600">
			Sie wurden erfolgreich von unserem Newsletter abgemeldet. Sie werden keine weiteren E-Mails
			von uns erhalten.
		</p>

		<a
			href="/"
			class="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
		>
			Zur Startseite
		</a>
	</div>
</div>
