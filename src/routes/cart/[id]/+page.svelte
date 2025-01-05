<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/button.svelte";
  import { loadStripe, type Stripe } from '@stripe/stripe-js';
  import { onMount } from 'svelte';
  import type { ActionData, PageServerData } from './$types';
  import PayPalButton from "$lib/components/PayPalButton.svelte";
  import { writable, derived } from 'svelte/store';

  const PUBLIC_STRIPE_KEY = import.meta.env.PUBLIC_STRIPE_KEY;

  type DiscountType = 'percentage' | 'absolute';
  
  interface Discount {
    value: number;
    discounttype: DiscountType;
  }

  export let data: PageServerData;
  export let form: ActionData;
  
  const booking = data;
  let stripe: Stripe | null = null;
  const vatRate = 0.19;

  // Stores
  const bookingStore = writable(booking);
  const formStore = writable(form);
  const discountCode = writable('');

  // Derived store for discount information
  const discountInfo = derived(formStore, $form => {
    if (!$form?.discount) return null;
    return {
      value: $form.discount.value,
      type: $form.discount.discountType
    };
  });

  const basePrice = derived(bookingStore, $booking => 
    $booking.tickets.reduce((sum, ticket) => sum + ticket.price, 0)
  );

  // Updated discountedPrice calculation with type check
  const discountedPrice = derived(
    [basePrice, discountInfo], 
    ([$basePrice, $discountInfo]) => {
      if (!$discountInfo) return $basePrice;

      if ($discountInfo.type === 'percentage') {
        // Percentage discount: multiply by (1 - percentage)
        return $basePrice * (1 - Number($discountInfo.value));
      } else {
        // Absolute discount: subtract the fixed amount
        // Ensure price doesn't go below 0
        console.log(Number($discountInfo.value));
        return Math.max(0, $basePrice - Number($discountInfo.value));

      }
    }
  );

  const vat = derived(
    discountedPrice, 
    $discountedPrice => $discountedPrice * vatRate
  );

  const total = derived(
    discountedPrice,
    $discountedPrice => $discountedPrice
  );

  // Update stores when props change
  $: formStore.set(form);
  $: bookingStore.set(booking);

  onMount(async () => {
    stripe = await loadStripe(PUBLIC_STRIPE_KEY);
  });

  // Helper function to format discount display
  function formatDiscount($discountInfo: { value: any; type: any; }, $basePrice: number): string {
    if (!$discountInfo) return '';
    
    if ($discountInfo.type === 'percentage') {
      return `${($discountInfo.value * 100)}%`;
    } else {
      return `${$discountInfo.value} €`;
    }
  }
</script>

<div class="checkout-container">
  <div class="checkout-left">
    <h2 class="section-title">Kontakt</h2>
    <form class="checkout-form">
      <input type="email" id="email" name="email" placeholder="E-Mail" required />

      <div class="newsletter">
        <input type="checkbox" id="newsletter" name="newsletter" />
        <label for="newsletter">Neuigkeiten und Angebote via E-Mail erhalten</label>
      </div>

      <h2 class="section-title" style="padding-top: 20px;">Rechungsadresse</h2>
      <select id="country" name="country" placeholder="Land / Region">
        <option value="Deutschland">Deutschland</option>
      </select>

      <div class="input-row">
        <input type="text" id="firstname" name="firstname" placeholder="Vorname" required />
        <input type="text" id="lastname" name="lastname" placeholder="Nachname" required />
      </div>

      <input type="text" id="address" name="address" placeholder="Adresse" required />
      <input type="text" id="additional-info" name="additional-info" placeholder="Wohnung, Zimmer, usw. (optional)" />

      <div class="input-row">
        <input type="text" id="postal-code" name="postal-code" placeholder="Postleitzahl" required />
        <input type="text" id="city" name="city" placeholder="Stadt" required />
      </div>

      <h2 class="section-title" style="padding-top: 20px;">Bezahlart</h2>
      <div class="payment-methods">
        <PayPalButton
          clientId="AbV-7ICaqhM9Xn21eTHQakdRmE0F5IS83yhLr5QNQBIWvbDZcqPPytIFq3AEPKjh09a3lpmMaQMo2DyW"
          amount="0.01"
          currency="EUR"
        />
      </div>
    </form>
  </div>

  <div class="vertical-divider"></div>

  <div class="checkout-right">
    <div class="order-summary">
      {#each $bookingStore.tickets as ticket (ticket.id)}
        <div class="item">
          <p>Film: {ticket.showingId}</p>
          <p>Zustand: {ticket.state}</p>
          <p>Typ: {ticket.type}</p>
          <p>Sitzplatz: {ticket.seatId}</p>
          <p>Preis: {ticket.price} €</p>
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
            bind:value={$discountCode}
          />
          <Button type="submit">Anwenden</Button>
        </form>
        
        {#if $formStore?.error}
          <p style="color: red;">{$formStore.error}</p>
        {:else if $formStore?.success}
          <p style="color: green;">{$formStore.success}</p>
        {/if}
      </div>

      <div class="totals">
        <div class="totals-row">
          <span>Zwischensumme:</span>
          <span>{$basePrice.toFixed(2)} €</span>
        </div>
        
        {#if $discountInfo}
          <div class="totals-row">
            <span>Rabatt ({formatDiscount($discountInfo, $basePrice)}):</span>
            <span>-{($basePrice - $discountedPrice).toFixed(2)} €</span>
          </div>
        {/if}
        
        <div class="totals-row">
          <span>inkl. MwSt ({(vatRate * 100).toFixed(0)}%):</span>
          <span>{$vat.toFixed(2)} €</span>
        </div>
        
        <div class="totals-row total">
          <span>Gesamt:</span>
          <span>{$total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .checkout-container {
    display: flex;
    justify-content: flex-end;
  }

  .checkout-left {
    flex: 3;
    max-width: 700px;
    padding: 20px;
  }

  .checkout-right {
    flex: 2;
    background-color: #f9f9f9;
    max-width: 700px;
    padding: 20px;
    border-radius: 5px;
    padding-right: 80px;
  }

  .vertical-divider {
    width: 2px;
    background-color: #ccc;
  }

  .checkout-form {
    display: flex;
    flex-direction: column;
  }

  .checkout-form input, .checkout-form select {
    margin-bottom: 15px;
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .input-row {
    display: flex;
    gap: 10px;
  }

  .input-row input {
    flex: 1;
    min-width: 0;
  }

  .newsletter {
    display: flex;
    align-items: center;
  }

  .newsletter label {
    margin-left: 10px;
  }

  .section-title {
    font-size: 18px;
    font-weight: bold;
  }

  .order-summary .item {
    border-bottom: 1px solid #ccc;
    padding: 10px 0;
    margin-bottom: 10px;
  }

  .totals-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
  }

  .totals-row.total {
    font-weight: bold;
    font-size: 1.2em;
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
</style>