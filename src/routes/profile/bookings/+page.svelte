<script lang="ts">
    import type { PageServerData } from './$types';
  
    type Booking = {
      showingDate: string | null;
      showingTime: string | null;
      movieTitle: string | null;
      cinemaName: string | null;
      hallName: string | null;
      seatRow: string | null;
      seatNumber: string | null;
      finalPrice: string | null;
      ticketTypeName: string | null;
      ticketStatus: "reserved" | "booked" | "validated" | "cancelled";
    };
  
    const { data }: { data: PageServerData } = $props();
    const bkngs: Booking[] = data.bookings as Booking[];
  
    // Group tickets by booking for a compact view
    const bookings = bkngs.reduce((acc: Record<string, Booking[]>, ticket) => {
      const key = `${ticket.showingDate}_${ticket.showingTime}_${ticket.movieTitle}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(ticket);
      return acc;
    }, {});
  </script>
  
  <div class="container mx-auto p-4 max-w-3xl">
    <h1 class="text-2xl font-bold text-center mt-6 mb-4">Buchungsübersicht</h1>
  
    {#if Object.keys(bookings).length > 0}
      <div class="bg-white shadow rounded p-4">
        {#each Object.entries(bookings) as [key, showingTickets]}
          {@const firstTicket = showingTickets[0]}
          <div class="mb-6 border-b pb-4 last:border-b-0">
            <h2 class="text-lg font-bold mb-2">{firstTicket.movieTitle || 'Unbekannter Film'}</h2>
            <p class="text-gray-700 text-sm mb-2">
              <strong>Vorstellung:</strong> {new Date(firstTicket.showingDate || '').toLocaleDateString('de-DE')} um {firstTicket.showingTime || 'Unbekannt'}
            </p>
            <p class="text-gray-700 text-sm mb-2">
              <strong>Kino:</strong> {firstTicket.cinemaName || 'Unbekannt'}, Saal {firstTicket.hallName || 'Unbekannt'}
            </p>
            <p class="text-gray-700 text-sm mb-2">
                <strong>Gesamtsumme:</strong> {firstTicket.finalPrice + '€' || 'Unbekannt'}
            </p>
  
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {#each showingTickets as ticket}
                <div class="border rounded p-3 bg-gray-50">
                  <p><strong>Platz:</strong> Reihe {ticket.seatRow || 'N/A'}, Platz {ticket.seatNumber || 'N/A'}</p>
                  <p><strong>Typ:</strong> {ticket.ticketTypeName || 'N/A'}</p>
                  <p class="text-right mt-2">
                    <span class="px-2 py-1 rounded-full {ticket.ticketStatus === 'booked' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                      {ticket.ticketStatus}
                    </span>
                  </p>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-8">
        <p class="text-xl text-gray-600">Keine Buchungen gefunden.</p>
      </div>
    {/if}
  </div>
  
  <style>
    .container {
      font-family: Arial, sans-serif;
    }
    .bg-white {
      background-color: white;
    }
    .shadow {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .rounded {
      border-radius: 8px;
    }
    .border {
      border: 1px solid #e2e8f0;
    }
    .text-center {
      text-align: center;
    }
    .text-gray-700 {
      color: #4a5568;
    }
    .text-sm {
      font-size: 0.875rem;
    }
    .text-lg {
      font-size: 1.125rem;
    }
    .font-bold {
      font-weight: bold;
    }
  </style>
  