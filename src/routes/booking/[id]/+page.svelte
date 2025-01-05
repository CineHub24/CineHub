<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    
    export let data: PageData;
    
    let { showing, tickets } = data;
    
    // State for selected seats
    let selectedSeats: Set<string> = new Set();
    
    // Format date and time
    const formatDateTime = (date: Date) => {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // Handle seat selection
    const toggleSeat = (seatId: string, isBooked: boolean) => {
        if (isBooked) return;
        
        if (selectedSeats.has(seatId)) {
            selectedSeats.delete(seatId);
        } else {
            selectedSeats.add(seatId);
        }
    };
    

</script>

<div class="container mx-auto p-4">
    <!-- Movie Info Section -->
    <div class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-4">Your Bookings</h1>
        {#if showing}
            <div class="mb-4">
                <h2 class="text-xl font-semibold">{showing.movieTitle}</h2>
                <p class="text-gray-600">
                    {formatDateTime(showing.startTime)}
                </p>
            </div>
        {/if}
    </div>

    <!-- Tickets Section -->
    <div class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Your Tickets</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each tickets as ticket}
                <div class="border rounded-lg p-4 shadow-sm">
                    <p class="font-semibold">Seat: {ticket.seatId}</p>
                    <p class="text-gray-600">Ticket Type: {ticket.ticketTypeId}</p>
                </div>
            {/each}
        </div>
    </div>



    <!-- Selected Seats Summary -->
    {#if selectedSeats.size > 0}
        <div class="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
            <div class="container mx-auto flex justify-between items-center">
                <div>
                    <p class="font-semibold">Selected Seats: {selectedSeats.size}</p>
                </div>
                <button 
                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Proceed to Payment
                </button>
            </div>
        </div>
    {/if}
</div>