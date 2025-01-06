<script>
// @ts-nocheck
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { onMount } from 'svelte'
    import { loadStripe } from '@stripe/stripe-js'
	  import { Elements, ExpressCheckout } from 'svelte-stripe';
    const PUBLIC_STRIPE_KEY = import.meta.env.VITE_PUBLIC_STRIPE_KEY
  
    /**
	 * @type {import("@stripe/stripe-js").Stripe | null}
	 */
    let stripe = null
    /**
	 * @type {{ message: any; } | null}
	 */
    let error = null
    /**
	 * @type {{ submit: () => any; }}
	 */
    let elements
    let processing = false
    // let stripe: Stripe | null = $state(null); // Stripe instance or null if not loaded
    // let error: { message: string } | null = null; // Error object from Stripe or null
    // let elements: ; // Elements instance from Stripe or undefined
    // let processing: boolean = false; // Flag to indicate ongoing processing
  
    const bookingId = page.url.pathname.replace('/cart/', '').replace('/stripev2', '');
    onMount(async () => {
      stripe = await loadStripe(PUBLIC_STRIPE_KEY)
    })
  
    async function createPaymentIntent() {
      const response = await fetch(page.url.pathname + '/payment-intent', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({})
      })
      const { clientSecret } = await response.json()
  
      return clientSecret
    }
  
    /**
	 * @param {{ detail: { resolve: (arg0: { emailRequired: boolean; phoneNumberRequired: boolean; lineItems: { name: string; amount: number; }[]; }) => void; }; }} event
	 */
    async function click(event) {
      const options = {
        emailRequired: true,
        phoneNumberRequired: true,
        lineItems: [
          {
            name: 'Tickets',
            amount: 1099
          }
        ]
      }
  
      event.detail.resolve(options)
    }
  
    async function confirm() {
      // avoid processing duplicates
      if (processing) return
  
      processing = true
  
      let result = await elements.submit()
  
      if (result.error) {
        // validation failed, notify user
        error = result.error
        processing = false
        return
      }
  
      // create payment intent server side
      const clientSecret = await createPaymentIntent()
      const return_url = new URL('/booking/' + bookingId, window.location.origin).toString()
  
      // confirm payment with stripe
      // @ts-ignore
      result = await stripe.confirmPayment({
        // @ts-ignore
        elements,
        clientSecret,
        confirmParams: {
          return_url
        }
      })
  
      // log results, for debugging
      console.log({ result })
  
      if (result.error) {
        // payment failed, notify user
        error = result.error
        processing = false
      } else {
        // payment succeeded, redirect to "thank you" page
        goto('/booking/' + bookingId)
      }
    }
  </script>
  
  <h1>Express Checkout Example</h1>
  
  {#if error}
    <p class="error">{error.message} Please try again.</p>
  {/if}
  
  <Elements
    {stripe}
    mode="payment"
    currency="eur"
    amount={1099}
    bind:elements>
  
    <ExpressCheckout
      on:confirm={confirm}
      on:click={click}
      buttonHeight={50}
      buttonTheme={{googlePay: 'white'}}
      buttonType={{googlePay: 'donate'}}
      paymentMethodOrder={['googlePay', 'link']}/>
  
  </Elements>
  
  <style>
    .error {
      color: tomato;
      margin: 2rem 0 0;
    }
  </style>