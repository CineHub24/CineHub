<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/button.svelte";
  import { loadStripe, type Stripe } from '@stripe/stripe-js';
  import { onMount } from 'svelte';
  import PayPalButton from "$lib/components/PayPalButton.svelte";
	import type { ActionData } from "./$types";
	import GoogleAutocomplete from "$lib/components/GoogleAutocomplete.svelte";
  import * as m from '$lib/paraglide/messages.js';
	import type { Film } from "lucide-svelte";
	import { type Seat } from "$lib/server/db/schema";

  let adress = '';
  const PUBLIC_STRIPE_KEY = import.meta.env.PUBLIC_STRIPE_KEY;
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  function handlePlaceSelected(event) {
		const adresse = event.detail;
		adress = adresse.formatted_address;
		console.log(m.selected_address({}), adresse);
	}

  interface Ticket {
    id: number;
    bookingId: number;
    showingId: number;
    seatId: number;
    price: number;

  }

  interface Showing {
    id: number;
    filmid: number;
    date: string;
    time: string;
    Film : Film;

  }

  interface Prices {
    basePrice: number;
    discount: {
      value: number;
      discountType: 'percentage' | 'absolute';
    } | null;
    discountedAmount: number;
    vatRate: number;
    vatAmount: number;
    total: number;
  }

  interface PageData {
    booking: {
      id: number;
      userId: number;
    };
    tickets: {
      Ticket: Ticket;
      Showing: Showing;
      Film: Film;    
      seat: Seat;

    }[];
    prices: Prices;
  }

  export let data: PageData;
  export let form: ActionData;
  
  let booking = data.booking;
  let tickets = data.tickets;
  let prices = data.prices;
  let stripe: Stripe | null = null;
  let discountCode = '';


  $: groupedTickets = Object.entries(
tickets.reduce((acc, ticket) => {
const key = ticket.Ticket.showingId;
if (!acc[key]) {
acc[key] = {
showingId: key,
showTitle: ticket.Film.title,
showDate: ticket.Showing.date,
showTime: ticket.Showing.time,
showTickets: []
};
}
acc[key].showTickets.push(ticket);
return acc;
}, {} as Record<number, { showingId: number; showTitle: string, showDate:string, showTime: string, showTickets: typeof tickets }>)
).map(([_, value]) => value);

function formatTime(timeString: string) {
const date = new Date(`1970-01-01T${timeString}Z`);
return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

  $: getShowingById = (showingId: number) => {
    return showings.find(show => show.Showing.id === showingId) as unknown as {Showing: Showing; Film: Film};
  };

  // Use prices from form data if available, otherwise use initial prices
  $: currentPrices = form?.prices || prices;

  // Helper function to format discount display
  function formatDiscount(discount: { value: number; discountType: string }): string {
    if (!discount) return '';
    
    if (discount.discountType === 'percentage') {
      return `${(discount.value * 100)}%`;
    } else {
      return `${discount.value} €`;
    }
  }

  onMount(async () => {
    stripe = await loadStripe(PUBLIC_STRIPE_KEY);
  });
</script>

<div class="checkout-container">
  <div class="checkout-left">
    <form class="checkout-form">      

      <h2 class="section-title" style="padding-top: 20px;">Rechungsadresse</h2>
      <select id="country" name="country" placeholder="Land / Region">
        <option value="Deutschland">Deutschland</option>
      </select>

      <div class="input-row">
        <input type="text" id="firstname" name="firstname" placeholder="Vorname" required />
        <input type="text" id="lastname" name="lastname" placeholder="Nachname" required />
      </div>
      
          <GoogleAutocomplete
            apiKey={API_KEY}
            placeholder={m.search_address({})}
            adress={adress}
            on:place-selected={handlePlaceSelected}
          />
      <div class="newsletter">
        <input type="checkbox" id="newsletter" name="newsletter" />
        <label for="newsletter">Neuigkeiten und Angebote via E-Mail erhalten</label>
      </div>

      <h2 class="section-title" style="padding-top: 20px;">Bezahlart</h2>
      <div class="payment-methods">
        <PayPalButton
          clientId="AbV-7ICaqhM9Xn21eTHQakdRmE0F5IS83yhLr5QNQBIWvbDZcqPPytIFq3AEPKjh09a3lpmMaQMo2DyW"
          amount={currentPrices.total.toFixed(2)}
          currency="EUR"
        />
      </div>

    </form>
  </div>

  <div class="vertical-divider"></div>

  <div class="checkout-right">
    <div class="order-summary">
    {#each groupedTickets as group}
    <div class="showing-group">
    <h3 class="showing-title">
    Film: {group.showTitle}<br>
    Vorstellung: {group.showDate} : {formatTime(group.showTime)}
    </h3>
    
    {#each group.showTickets as ticket}
    <div class="item">
    <p>Sitzplatz: {ticket.seat.row}{ticket.seat.seatNumber}</p>
    <p>Preis: {ticket.Ticket.price} €</p>
    </div>
    {/each}
    </div>
    {/each}
      <div class="discount">
        <form action="?/discount" method="post">
          <input 
            type="text" 
            id="discount-code" 
            name="discount-code" 
            placeholder="Code eingeben" 
            class="rounded-input"
            bind:value={discountCode}
          />
          <Button type="submit">Anwenden</Button>
        </form>
        
        {#if form?.error}
          <p style="color: red;">{form.error}</p>
        {:else if form?.success}
          <p style="color: green;">{form.success}</p>
        {/if}
      </div>

      <div class="totals">
        <div class="totals-row">
          <span>Zwischensumme:</span>
          <span>{currentPrices.basePrice.toFixed(2)} €</span>
        </div>
        
        {#if currentPrices.discount}
          <div class="totals-row">
            <span>Rabatt ({formatDiscount(currentPrices.discount)}):</span>
            <span>-{currentPrices.discountedAmount.toFixed(2)} €</span>
          </div>
        {/if}
        
        <div class="totals-row">
          <span>inkl. MwSt ({(currentPrices.vatRate * 100).toFixed(0)}%):</span>
          <span>{currentPrices.vatAmount.toFixed(2)} €</span>
        </div>
        
        <div class="totals-row total">
          <span>Gesamt:</span>
          <span>{currentPrices.total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .showing-title {
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .checkout-container {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    gap: 40px;
  }

  .checkout-left {
    flex: 3;
    max-width: 700px;
  }

  .checkout-right {
    flex: 2;
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 5px;
    max-width: 500px;
  }

  .vertical-divider {
    width: 1px;
    background-color: #ccc;
  }

  .checkout-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .checkout-form input, 
  .checkout-form select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }

  .input-row {
    display: flex;
    gap: 10px;
  }

  .input-row input {
    flex: 1;
  }

  .newsletter {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin: 20px 0 10px 0;
  }

  .order-summary .item {
    border-bottom: 1px solid #eee;
    padding: 10px 0;
  }

  .totals-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
  }

  .totals-row.total {
    font-weight: bold;
    font-size: 1.2em;
    border-top: 2px solid #eee;
    margin-top: 10px;
    padding-top: 10px;
  }

  .discount {
    margin: 20px 0;
  }

  .discount form {
    display: flex;
    gap: 10px;
  }

  .rounded-input {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    flex: 1;
  }

  .showing-group {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #eee;
  }

  .payment-methods {
    margin-top: 20px;
  }
</style>