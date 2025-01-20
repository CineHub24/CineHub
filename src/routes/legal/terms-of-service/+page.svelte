<!-- Terms.svelte -->
<script>
	import { fade } from 'svelte/transition';
</script>

<div class="min-h-screen bg-gray-50" in:fade>
	<div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
		<h1 class="mb-8 text-4xl font-bold text-gray-900">Allgemeine Geschäftsbedingungen</h1>

		<div class="prose prose-lg">
			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">1. Geltungsbereich</h2>
				<p class="mb-4 text-gray-600">
					Diese Allgemeinen Geschäftsbedingungen gelten für alle gegenwärtigen und zukünftigen
					Geschäftsbeziehungen zwischen uns und unseren Kunden.
				</p>
			</section>

			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">2. Vertragsschluss</h2>
				<p class="mb-4 text-gray-600">
					Der Vertrag kommt durch Angebot und Annahme zustande. Unsere Angebote sind freibleibend
					und unverbindlich.
				</p>
			</section>

			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">3. Lieferung und Versand</h2>
				<p class="mb-4 text-gray-600">
					Die Lieferung erfolgt an die vom Kunden angegebene Lieferadresse. Teillieferungen sind
					zulässig, soweit dies für den Kunden zumutbar ist.
				</p>
			</section>

			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">4. Widerrufsrecht</h2>
				<p class="mb-4 text-gray-600">
					Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
					widerrufen.
				</p>
			</section>
		</div>
	</div>
</div>
