import Stripe from 'stripe'
const SECRET_STRIPE_KEY = import.meta.env.VITE_SECRET_STRIPE_KEY
const DOMAIN = import.meta.env.VITE_DOMAIN

const stripe = new Stripe(SECRET_STRIPE_KEY);
const return_url = new URL(
  '/examples/embedded-checkout/thanks?session_id={CHECKOUT_SESSION_ID}',
  DOMAIN
).toString()

export async function load() {
  const price = await stripe.prices.create({
    currency: 'eur',
    unit_amount: 1000,
    // recurring: {
    //   interval: 'month',
    // },
    product_data: {
      name: 'Irgendein Preis 10er',
    },
  });

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [
      {
        price: price.id,
        quantity: 1
      }
    ],
    mode: 'payment',
    return_url
  })

  console.log("Created a price + a session which expires at: " + session.expires_at)

  return {
    clientSecret: session.client_secret
  }
}