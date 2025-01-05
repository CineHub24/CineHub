<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/button.svelte";
  import { loadStripe, type Stripe } from '@stripe/stripe-js';
  import { onMount } from 'svelte';
  import type { PageServerData } from './$types';
  import PayPalButton from "$lib/components/PayPalButton.svelte";
  import { writable, derived } from 'svelte/store';

  const PUBLIC_STRIPE_KEY = import.meta.env.PUBLIC_STRIPE_KEY;

  const { data }: { data: PageServerData } = $props();
  const booking = data;

  let stripe: Stripe | null = null;

  //let totalPrice = 0;
  //let vat = 0;
  const vatRate = 0.19; // 19% MwSt

  const discountCode = writable(''); // Eingabefeld für den Rabattcode
  const appliedDiscountCode = writable(''); // Tatsächlich eingelöster Rabattcode

  const discount = () => {
  switch ($appliedDiscountCode.toLowerCase()) {
    case 'welcome10':
      return 0.1; // 10%
    case 'greg20':
      return 0.2; // 20%
    case 'happy-birthday15':
      return 0.15; // 15%
    default:
      return 0; // Kein Rabatt
  }
};


  // Reaktive Berechnung von totalPrice und vat
  const totalPrice = booking.tickets.reduce((sum, ticket) => sum + ticket.price, 0) * (1- discount);
  const vat = totalPrice * vatRate;

  onMount(async () => {
    stripe = await loadStripe(PUBLIC_STRIPE_KEY);
  });
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

      <input type="text" id="address" name="address" placeholder="Adresse" required style="margin-bottom: 10px;" />
      <input type="text" id="additional-info" name="additional-info" placeholder="Wohnung, Zimmer, usw. (optional)" style="margin-bottom: 10px;" />

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
    <div class="legal-links">
      <a href="#" class="underline">Widerrufsrecht</a>
      <a href="#" class="underline">Datenschutzerklärung</a>
      <a href="#" class="underline">Allgemeine Geschäftsbedingungen</a>
      <a href="#" class="underline">Impressum</a>
    </div>
  </div>

  <div class="vertical-divider"></div>

  <div class="checkout-right">
    <div class="order-summary">
      {#each booking.tickets as ticket (ticket.id)}
  <div class="item">
    <p>Film: {ticket.showingId}</p>
    <p>Zustand: {ticket.state}</p>
    <p>Typ: {ticket.type}</p>
    <p>Sitzplatz: {ticket.seatId}</p>
    <p>Preis: {ticket.price} €</p>
  </div>
{/each}
      <div class="discount">
        <input type="text" id="discount-code" name="discount-code" placeholder="Code eingeben" class="rounded-input" />
        <Button type="button">Anwenden</Button>
      </div>
      <div class="totals">
        <div class="totals-row">
          <span>Zwischensumme:</span>
          <span>{totalPrice.toFixed(2)} €</span>
        </div>
        <div class="totals-row">
          <span>inkl. MwSt ({(vatRate * 100).toFixed(0)}%):</span>
          <span>{vat.toFixed(2)} €</span>
        </div>
        <div class="totals-row total">
          <span>Gesamt:</span>
          <span>{(totalPrice).toFixed(2)} €</span>
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
    display: flex; /* Flexbox-Layout aktivieren */
    gap: 10px; /* Abstand zwischen den Feldern */
}

.input-row input {
    flex: 1; /* Gleiche Breite für beide Inputs */
    min-width: 0; /* Verhindert, dass Inhalte das Layout sprengen */
}

.newsletter {
    display: flex;
    align-items: center; /* Für bessere Ausrichtung */
}

.newsletter label {
    margin-top: -12px; /* Den Text leicht nach oben verschieben */
    margin-left: 10px;
}

  .rounded-input {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
  }

  .payment-methods {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .section-title {
    font-size: 18px;
    font-weight: bold;
  }

  .legal-links {
    margin-top: 260px;
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }

  .legal-links a {
    text-decoration: underline;
  }

  .order-summary {
    padding: 15px;
    border-radius: 5px;
  }

  .order-summary .item, .order-summary .totals {
    margin-bottom: 15px;
  }

  .order-summary .discount {
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .totals {
    margin-top: 15px;
}

.totals-row {
    display: flex; /* Flexbox aktivieren */
    justify-content: space-between; /* Elemente links und rechts ausrichten */
    padding: 5px 0; /* Abstand zwischen den Reihen */
}

.totals-row.total {
    font-weight: bold; /* Fett für die Gesamtzeile */
    font-size: 1.2em; /* Größere Schrift für die Gesamtzeile */
}

.discount {
    display: flex; /* Aktiviert Flexbox */
    gap: 10px; /* Abstand zwischen Textfeld und Button */
    align-items: center; /* Vertikale Zentrierung */
}

.discount .rounded-input {
    flex: 1; /* Nimmt so viel Platz wie möglich ein */
    min-width: 0; /* Verhindert Layout-Probleme bei Überlauf */
}
.order-summary .item {
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
  margin-bottom: 10px;
}

  Button.disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>
