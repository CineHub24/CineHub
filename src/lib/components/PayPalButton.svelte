<script lang="ts">
    import { onMount } from "svelte";
    import { loadScript } from "@paypal/paypal-js";
  
    export let clientId: string;
    export let amount: string = "10.00";
    export let currency: string = "USD";
  
    let paypalContainer: HTMLDivElement | null = null;
  
    onMount(async () => {
      try {
        const paypal = await loadScript({
          clientId: clientId, // Verwende camelCase
          currency: currency,
        });
  
        if (paypal && paypal.Buttons) {
          paypal
            .Buttons({
              createOrder: (data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        currency_code: currency, // Währung muss angegeben werden
                        value: amount,
                      },
                    },
                  ],
                });
              },
              onApprove: (data, actions) => {
                if (actions?.order) {
                  return actions.order.capture().then((details) => {
                    const firstName = details.payer?.name?.given_name || "Kunde";
                    alert(`Bezahlung erfolgreich! Danke, ${firstName}.`);
                  });
                } else {
                  console.error("Fehler: actions.order ist undefined.");
                }
              },
              onError: (err) => {
                console.error("PayPal Fehler:", err);
              },
            })
            .render(paypalContainer);
        } else {
          console.error("PayPal SDK konnte nicht geladen werden.");
        }
      } catch (error) {
        console.error("Fehler beim Laden des PayPal SDKs:", error);
      }
    });
  </script>
  
  <div bind:this={paypalContainer}></div>
  