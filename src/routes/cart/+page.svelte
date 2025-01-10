<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/button.svelte';
  import { loadStripe, type Stripe } from '@stripe/stripe-js';
  import { onMount } from 'svelte';
  import PayPalButton from '$lib/components/PayPalButton.svelte';
  import type { ActionData } from './$types';
  import GoogleAutocomplete from '$lib/components/GoogleAutocomplete.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { Film } from 'lucide-svelte';
  import { ShoppingBag, Trash2 } from 'lucide-svelte';
  import { type Seat, type PriceSet, type SeatCategory, type TicketType, type Booking } from '$lib/server/db/schema';
  import type { TicketWithDetails } from './+page.server';
  import type { B } from 'vitest/dist/chunks/benchmark.geERunq4.js';
  
  let adress = '';
  const PUBLIC_STRIPE_KEY = import.meta.env.PUBLIC_STRIPE_KEY;
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  function handlePlaceSelected(event) {
  const adresse = event.detail;
  adress = adresse.formatted_address;
  console.log(m.selected_address({}), adresse);
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
  export let data;
  export let form: ActionData;
  let booking = data.booking as Booking;
  let tickets = data.tickets as TicketWithDetails[];
  let prices = data.prices as Prices;
  let stripe: Stripe | null = null;
  let discountCode = '';
  
  $: groupedTickets = Object.entries(
  tickets.reduce(
  (acc, ticket) => {
  const key = ticket.Ticket.showingId as number;
  if (!acc[key]) {
  acc[key] = {
  showingId: key,
  showTitle: ticket.Film.title || '',
  showDate: ticket.Showing.date,
  showTime: ticket.Showing.time,
  showTickets: []
  };
  }
  acc[key].showTickets.push(ticket);
  return acc;
  },
  {} as Record<
  number,
  {
  showingId: number;
  showTitle: string;
  showDate: string;
  showTime: string;
  showTickets: typeof tickets;
  }
  >
  )
  ).map(([_, value]) => value);
  
  function formatTime(timeString: string) {
  const date = new Date(`1970-01-01T${timeString}Z`);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  $: currentPrices = form?.prices || prices;
  
  function formatDiscount(discount: { value: number; discountType: string }): string {
  if (!discount) return '';
  
  if (discount.discountType === 'percentage') {
  return `${discount.value * 100}%`;
  } else {
  return `${discount.value} €`;
  }
  }
  
  onMount(async () => {
  stripe = await loadStripe(PUBLIC_STRIPE_KEY);
  });
  
  function handleDeleteTicket(ticketId: number) {
  console.log(`Deleting ticket with ID: ${ticketId}`);
  }
  </script>
  
  {#if tickets.length !== 0}
  <div class="flex justify-center items-center min-h-screen bg-gray-50 p-4">
  <div class="bg-white rounded-xl shadow-lg w-full max-w-7xl">
  <div class="checkout-container">
  <div class="checkout-left">
  <div class="tickets-list">
  {#each groupedTickets as group}
  <div class="showing-group">
  <h3 class="showing-title">
  {m.cart_film({})} {group.showTitle}<br />
  {m.cart_show({})} {formatTime(group.showTime)}
  </h3>
  
  {#each group.showTickets as ticket}
  <div class="ticket-container" style="background-image: url({ticket.Film.backdrop})">
  <div class="ticket-info">
  <p>{m.cart_seat({})} {ticket.seat.row}{ticket.seat.seatNumber}</p>
  <p>{m.cart_typ({})} {ticket.TicketType.name}</p>
  <p>{m.cart_seattype({})} {ticket.seatCategory.name}</p>
  <p>{m.cart_price({})} {ticket.Ticket.price} €</p>
  </div>
  <div>
  <form action="?/delete" method="post">
  <input type="hidden" name="ticketId" value={ticket.Ticket.id} />
  <button type="submit" class="delete-icon">
  <Trash2 size={20} />
  </button>
  </form>
  </div>
  </div>
  {/each}
  </div>
  {/each}
  </div>
  </div>
  
  <div class="checkout-right">
  <div class="order-summary">
  <div class="discount">
  <form action="?/discount" method="post">
  <input
  type="text"
  id="discount-code"
  name="discount-code"
  placeholder={m.cart_enter_discount({})}
  class="rounded-input"
  bind:value={discountCode}
  />
  <Button type="submit">{m.submit({})}</Button>
  </form>
  
  {#if form?.error}
  <p style="color: red;">{form.error}</p>
  {:else if form?.success}
  <p style="color: green;">{form.success}</p>
  {/if}
  </div>
  
  <div class="totals">
  <div class="totals-row">
  <span>{m.cart_subtotal({})}</span>
  <span>{currentPrices.basePrice.toFixed(2)} €</span>
  </div>
  
  {#if currentPrices.discount}
  <div class="totals-row">
  <span>{m.cart_discount({})} ({formatDiscount(currentPrices.discount)}):</span>
  <span>-{currentPrices.discountedAmount.toFixed(2)} €</span>
  </div>
  {/if}
  
  <div class="totals-row">
  <span>{m.cart_VAT({})}({(currentPrices.vatRate * 100).toFixed(0)}%):</span>
  <span>{currentPrices.vatAmount.toFixed(2)} €</span>
  </div>
  
  <div class="totals-row total">
  <span>{m.cart_total({})}</span>
  <span>{currentPrices.total.toFixed(2)} €</span>
  </div>
  </div>
  </div>
  
  <h2 class="section-title">{m.cart_payment_type({})}</h2>
  <div class="payment-methods">
  <PayPalButton
  amount={currentPrices.total.toFixed(2)}
  currency="EUR"
  bookingId={booking.id}
  />
  </div>
  </div>
  </div>
  </div>
  </div>
  {:else}
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
  <div class="text-center">
  <ShoppingBag size={64} class="mx-auto mb-4 text-gray-400" />
  <h2 class="text-2xl font-semibold text-gray-800 mb-2">
  {m.cart_empty_h2({})}
  </h2>
  <p class="text-gray-600 mb-6">
  {m.cart_empty_p({})}
  </p>
  <a
  href="/"
  class="inline-block px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition duration-300"
  >
  {m.cart_goto_program({})}
  </a>
  </div>
  </div>
  {/if}
  
  <style>
  .showing-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  }
  
  .checkout-container {
  display: flex;
  gap: 40px;
  padding: 40px;
  width: 100%;
  height: 80vh;
  }
  
  .checkout-left {
  flex: 1.2;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  }
  
  .tickets-list {
  overflow-y: auto;
  flex-grow: 1;
  padding-right: 15px;
  }
  
  .checkout-right {
  flex: 0.8;
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  min-width: 320px;
  overflow-y: auto;
  }
  
  .order-summary .item {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  }
  
  .ticket-info {
  flex: 1;
  font-size: 1.1em;
  }
  
  .delete-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: #ff4136;
  padding: 8px;
  }
  
  .delete-icon:hover {
  color: #d90000;
  }
  
  .totals-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 1.1em;
  }
  
  .totals-row.total {
  font-weight: bold;
  font-size: 1.3em;
  border-top: 2px solid #eee;
  margin-top: 15px;
  padding-top: 15px;
  }
  
  .discount {
  margin-bottom: 30px;
  }
  
  .discount form {
  display: flex;
  gap: 15px;
  }
  
  .rounded-input {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  flex: 1;
  font-size: 1.1em;
  }
  
  .showing-group {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
  }
  
  .showing-group:last-child {
  margin-bottom: 0;
  border-bottom: none;
  }
  
  .payment-methods {
  margin-top: 30px;
  }
  
  .section-title {
  font-size: 1.5em;
  font-weight: bold;
  margin: 25px 0 15px 0;
  }
  
  .ticket-container {
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  }
  
  .ticket-container::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  }
  
  .ticket-info {
  position: relative;
  z-index: 1;
  flex-grow: 1;
  }
  
  .delete-icon {
  position: relative;
  z-index: 1;
  }
  
  @media (max-width: 768px) {
  .checkout-container {
  flex-direction: column;
  padding: 20px;
  height: auto;
  }
  
  .checkout-left,
  .checkout-right {
  width: 100%;
  max-height: 60vh;
  overflow-y: auto;
  }
  }
  </style>