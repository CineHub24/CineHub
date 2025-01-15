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

<div class="container mx-auto p-4 max-w-3xl">
  <h1 class="text-2xl font-bold text-center mt-6 mb-4">Buchungsübersicht</h1>

  {#if bookings && bookings.length > 0}
    <div class="space-y-4">
      {#each bookings as booking (booking.id)}
        <a 
          href="/booking/{booking.id}"
          class="block bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-200"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-sm text-gray-600">
                Buchungsdatum: {formatDate(booking.date)} {formatTime(booking.time)}
              </p>
              <p class="text-sm text-gray-600">
                Buchungsnummer: #{booking.id}
              </p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm {getStatusColor(booking.status)}">
              {booking.status}
            </span>
          </div>

          <div class="border-t pt-4">
            <div class="flex justify-between items-center">
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
    <div class="bg-white shadow-lg rounded-lg p-8 text-center">
      <p class="text-gray-600">Keine Buchungen gefunden.</p>
    </div>
  {/if}
</div>