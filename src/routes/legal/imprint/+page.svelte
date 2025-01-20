<!-- Imprint.svelte -->
<script>
	import { fade } from 'svelte/transition';
</script>

<div class="min-h-screen bg-gray-50" in:fade>
	<div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
		<h1 class="mb-8 text-4xl font-bold text-gray-900">Impressum</h1>

		<div class="prose prose-lg">
			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">Angaben gemäß § 5 TMG</h2>
				<div class="text-gray-600">
					<p class="mb-2">Musterfirma GmbH</p>
					<p class="mb-2">Musterstraße 123</p>
					<p class="mb-2">12345 Musterstadt</p>
					<p class="mb-2">Deutschland</p>
				</div>
			</section>

			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">Kontakt</h2>
				<div class="text-gray-600">
					<p class="mb-2">Telefon: +49 (0) 123 456789</p>
					<p class="mb-2">E-Mail: info@musterfirma.de</p>
				</div>
			</section>

			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">Handelsregister</h2>
				<div class="text-gray-600">
					<p class="mb-2">Registergericht: Amtsgericht Musterstadt</p>
					<p class="mb-2">Registernummer: HRB 12345</p>
				</div>
			</section>

			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">Umsatzsteuer-ID</h2>
				<div class="text-gray-600">
					<p class="mb-2">Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:</p>
					<p class="mb-2">DE 123456789</p>
				</div>
			</section>
		</div>
	</div>
</div>
