<!-- Privacy.svelte -->
<script>
	import { fade } from 'svelte/transition';
</script>

<div class="min-h-screen bg-gray-50" in:fade>
	<div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
		<h1 class="mb-8 text-4xl font-bold text-gray-900">Datenschutzerklärung</h1>

		<div class="prose prose-lg">
			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">1. Datenschutz auf einen Blick</h2>
				<p class="mb-4 text-gray-600">
					Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
					personenbezogenen Daten vertraulich und entsprechend der gesetzlichen
					Datenschutzvorschriften sowie dieser Datenschutzerklärung.
				</p>
			</section>

			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">2. Allgemeine Hinweise</h2>
				<p class="mb-4 text-gray-600">
					Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
					personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
				</p>
			</section>

			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">
					3. Datenerfassung auf unserer Website
				</h2>
				<h3 class="mb-3 text-xl font-semibold text-gray-900">Cookies</h3>
				<p class="mb-4 text-gray-600">
					Unsere Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf
					Ihrem Endgerät speichert.
				</p>
			</section>

			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">
					4. Analyse-Tools und Tools von Drittanbietern
				</h2>
				<p class="mb-4 text-gray-600">
					Beim Besuch unserer Website kann Ihr Surf-Verhalten statistisch ausgewertet werden. Das
					geschieht vor allem mit Cookies und mit sogenannten Analyseprogrammen.
				</p>
			</section>
		</div>
	</div>
</div>
