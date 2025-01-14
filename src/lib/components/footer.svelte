<script>
	import * as m from '$lib/paraglide/messages.js';
	import { showNotification } from '$lib/stores/notification';
	import Notifications from '$lib/components/notifications.svelte';

	const currentYear = new Date().getFullYear();

	let email = '';
	let message = '';

	async function handleSubmit() {
		try {
			const response = await fetch('/api/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email })
			});

			const data = await response.json();

			if (response.ok) {
				showNotification(data.message || m.subscription_success({}));
				email = ''; //Eingabefeld leeren
			} else {
				showNotification(data.error || m.subscription_error({}));
			}
		} catch (error) {
			showNotification(m.connection_error({}));
			console.error(error);
		}
	}
</script>

<footer class="bg-gray-100 text-gray-800">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
			<!-- About Section -->
			<div>
				<h3 class="mb-4 text-lg font-semibold">{m.about({})}</h3>
				<p class="text-sm">
					{m.about_us_text({})}
				</p>
			</div>
			<!-- Links Section -->
			<div>
				<h3 class="mb-4 text-lg font-semibold">{m.quick_links({})}</h3>
				<ul class="space-y-2">
					<li><a href="/" class="transition hover:text-gray-600">{m.home({})}</a></li>
					<!-- <li><a href="/program" class="transition hover:text-gray-600">{m.program({})}</a></li> -->
					<li><a href="/profile/tickets" class="transition hover:text-gray-600">{m.tickets({})}</a></li>
					<li><a href="/about-us" class="transition hover:text-gray-600">{m.about({})}</a></li>
				</ul>
			</div>
			<!-- Resources Section -->
			<div>
				<h3 class="mb-4 text-lg font-semibold">{m.legal({})}</h3>
				<ul class="space-y-2">
					<li><a href="#" class="transition hover:text-gray-600">{m.privacy_policy({})}</a></li>
					<li><a href="#" class="transition hover:text-gray-600">{m.terms_of_service({})}</a></li>
					<li><a href="#" class="transition hover:text-gray-600">{m.imprint({})}</a></li>
				</ul>
			</div>
			<!-- Newsletter Section -->
			<div>
				<h3 class="mb-4 text-lg font-semibold">{m.stay_in_touch({})}</h3>
				<p class="mb-4 text-sm">
					{m.newsletter_text({})}
				</p>
				<form class="flex space-x-2" on:submit|preventDefault={handleSubmit}>
					<input
						required
						type="email"
						placeholder={m.your_email({})}
						bind:value={email}
						class="w-full rounded-md bg-gray-200 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						type="submit"
						class="rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
					>
						{m.subscribe({})}
					</button>
				</form>
			</div>
		</div>
		<div class="mt-8 border-t border-gray-300 pt-4 text-center text-sm">
			<p>&copy; {currentYear} CineHub. {m.copy_right({})}</p>
		</div>
	</div>
</footer>
<Notifications />
