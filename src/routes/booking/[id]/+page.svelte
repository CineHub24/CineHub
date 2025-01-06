<script lang="ts">
    import type { PageData } from './$types';
    
    let {data} = $props();
    
    let showing = $state(data.showing);
    let tickets = $state(data.tickets);
    
    function formatTime(timeString: string) {
        const date = new Date(`1970-01-01T${timeString}Z`);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const groupedTickets = $derived(
        Object.entries(
            tickets.reduce((acc, ticket) => {
                const key = ticket.showingId;
                if (!acc[key]) {
                    acc[key] = {
                        showingId: key,
                        showTickets: []
                    };
                }
                acc[key].showTickets.push(ticket);
                return acc;
            }, {} as Record<number, { showingId: number; showTickets: typeof tickets }>)
        ).map(([_, value]) => value)
    );

    const totalTickets = $derived(tickets.length);
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Your Bookings</h1>

    <!-- Shows and Tickets Section -->
    <div class="space-y-8">
        {#each groupedTickets as groupedTicket}
            <div class="bg-white rounded-lg shadow-md p-6">
                <!-- Show Information -->
                <div class="border-b pb-4 mb-4">
                    <h2 class="text-xl font-semibold">Show #{groupedTicket.showingId}</h2>
                    {#if showing && showing.id === groupedTicket.showingId}
                        <p class="text-gray-600">
                            Time: {formatTime(showing.time)}
                        </p>
                    {/if}
                </div>

                <!-- Tickets for this show -->
                <div>
                    <h3 class="text-lg font-semibold mb-3">Tickets</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {#each groupedTicket.showTickets as ticket}
                            <div class="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                <p class="font-semibold">Seat: {ticket.seatId}</p>
                                <p class="text-gray-600">Type: {ticket.type}</p>
                                <div class="mt-2 text-sm text-gray-500">
                                    Ticket ID: #{ticket.id}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/each}
    </div>

    <!-- Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
        <div class="container mx-auto flex justify-between items-center">
            <div>
                <p class="font-semibold">Total Tickets: {totalTickets}</p>
            </div>
            <button 
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Proceed to Payment
            </button>
        </div>
    </div>
</div>