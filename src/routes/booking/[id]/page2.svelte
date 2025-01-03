<script lang="ts">
    import type { PageData } from './$types';
    const { data } = $props<{ data: PageData }>();
    
    type Ticket = (typeof data.tickets)[0];
    
    // Gruppiere Tickets nach Vorstellung
    const ticketsByShowing = data.tickets.reduce<Record<string, Ticket[]>>((acc, ticket) => {
      // Erstelle einen unique key für jede Vorstellung
      const showingKey = `${ticket.movieTitle}_${ticket.showingDate}_${ticket.showingTime}`;
      if (!acc[showingKey]) acc[showingKey] = [];
      acc[showingKey].push(ticket);
      return acc;
    }, {});
  </script>
  
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- Buchungsüberschrift -->
      <div class="p-6 bg-gray-50">
        <h1 class="text-3xl font-bold mb-2">Ihre Buchung</h1>
        <p class="text-gray-600">Buchungsnummer: #{data.tickets[0].bookingId}</p>
      </div>
  
      <!-- Vorstellungen Loop -->
      {#each Object.entries(ticketsByShowing) as [showingKey, tickets]}
        {@const firstTicket = tickets[0]}
        
        <div class="border-b">
          <!-- Film und Vorstellungsinfo -->
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-2">{firstTicket.movieTitle}</h2>
            <div class="flex items-center gap-4 text-gray-600 mb-4">
              <span>{firstTicket.showingDate}</span>
              <span>•</span>
              <span>{firstTicket.showingTime}</span>
              <span>•</span>
              <span>{firstTicket.showingLanguage}</span>
              {#if firstTicket.showingDimension}
                <span>•</span>
                <span>{firstTicket.showingDimension}</span>
              {/if}
            </div>
  
            <!-- Kino Info -->
            <div class="mb-4">
              <p class="font-semibold">{firstTicket.hallName}</p>
              <p class="text-gray-600">{firstTicket.cinemaAddress}</p>
            </div>
  
            <!-- Tickets für diese Vorstellung -->
            <div class="space-y-2">
              <h3 class="font-semibold mb-2">Tickets:</h3>
              {#each tickets as ticket}
                <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span class="font-medium">{ticket.seatType}</span>
                    <span class="text-gray-600 ml-2">{ticket.ticketTypeName}</span>
                  </div>
                  <div class="text-gray-600">
                    Reihe {ticket.seatRow} - Platz {ticket.seatNumber}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/each}
  
      <!-- Buchungsdetails -->
      <div class="p-6 border-b">
        <h2 class="text-xl font-semibold mb-3">Buchungsdetails</h2>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Buchungsdatum</span>
            <span>{data.tickets[0].bookingDate} {data.tickets[0].bookingTime}</span>
          </div>
          {#if data.tickets[0].discountCode}
            <div class="flex justify-between text-green-600">
              <span>Angewendeter Rabatt</span>
              <span>{data.tickets[0].discountCode} ({data.tickets[0].discountValue}%)</span>
            </div>
          {/if}
          <div class="flex justify-between text-lg font-bold mt-4">
            <span>Gesamtbetrag</span>
            <span>{data.tickets[0].bookingTotalPrice} €</span>
          </div>
        </div>
      </div>
  
      <!-- Aktionen -->
      <div class="p-6 flex justify-between items-center">
        <button
          class="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
          on:click={() => window.print()}
        >
          Bestätigung drucken
        </button>
        <a
          href="/"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Zur Startseite
        </a>
      </div>
    </div>
  </div>