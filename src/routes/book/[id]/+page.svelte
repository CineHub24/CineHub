<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/button.svelte";
  import { loadStripe, type Stripe } from '@stripe/stripe-js'
  import { Elements } from 'svelte-stripe'
  import { onMount } from 'svelte'
  const PUBLIC_STRIPE_KEY = import.meta.env.PUBLIC_STRIPE_KEY

  export let data./summary/$types.js;
  const booking = data;

  let stripe: Stripe | null = null;

  onMount(async () => {
    stripe = await loadStripe(PUBLIC_STRIPE_KEY)
  })
</script>
  
<div class="container">
  <div class="header">
    <a href="/">Home</a>
    <a href="/cart">Einkaufswagen</a>
  </div>

  <p>{booking.tickets.length} Tickets</p>
  <p>Gesamtsumme: {booking.totalPrice}</p>

  <Button type="button" on:click={() => goto('https://stripe.com/')}>
    Pay now
  </Button>

  <Elements {stripe}>
    <!-- this is where your Stripe components go -->
  </Elements>

  <Button type="button" on:click={() => goto(`/booking/${booking.id}`)}>
    Pay at cinema
  </Button>
</div>