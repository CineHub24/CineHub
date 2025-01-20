<script lang="ts">
	const { data }: { data: PageServerData } = $props();
	const bookings = data.bookings;

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString('de-DE');
	};

	const formatTime = (timeStr: string) => {
		return timeStr?.slice(0, 5) || 'Unbekannt';
	};

	const getStatusColor = (status: string) => {
		const statusColors = {
			completed: 'bg-green-100 text-green-800',
			cart: 'bg-yellow-100 text-yellow-800',
			cancelled: 'bg-red-100 text-red-800',
			default: 'bg-gray-100 text-gray-800'
		};
		return statusColors[status] || statusColors.default;
	};
</script>

<div class="container mx-auto max-w-3xl p-4">
	<h1 class="mb-4 mt-6 text-center text-2xl font-bold">Buchungsübersicht</h1>

	{#if bookings && bookings.length > 0}
		<div class="space-y-4">
			{#each bookings as booking (booking.id)}
				<a
					href="/booking/{booking.id}"
					class="block rounded-lg bg-white p-6 shadow-lg transition-shadow duration-200 hover:shadow-xl"
				>
					<div class="mb-4 flex items-start justify-between">
						<div>
							<p class="text-sm text-gray-600">
								Buchungsdatum: {formatDate(booking.date)}
								{formatTime(booking.time)}
							</p>
							<p class="text-sm text-gray-600">
								Buchungsnummer: #{booking.id}
							</p>
						</div>
						<span class="rounded-full px-3 py-1 text-sm {getStatusColor(booking.status)}">
							{booking.status}
						</span>
					</div>

					<div class="border-t pt-4">
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium">Anzahl Tickets: {booking.items}</p>
								{#if booking.discountValue && booking.discountValue > 0}
									<p class="text-sm text-green-600">
										Rabatt: {booking.discountValue}€
									</p>
								{/if}
							</div>
							<div class="text-right">
								<p class="text-sm text-gray-600">Ursprünglicher Preis: {booking.basePrice}€</p>
								<p class="text-lg font-bold">Endpreis: {booking.finalPrice}€</p>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg bg-white p-8 text-center shadow-lg">
			<p class="text-gray-600">Keine Buchungen gefunden.</p>
		</div>
	{/if}
</div>
