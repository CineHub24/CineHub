import { json } from '@sveltejs/kit'
import Stripe from 'stripe'

const SECRET_STRIPE_KEY = import.meta.env.VITE_SECRET_STRIPE_KEY

const stripe = new Stripe(SECRET_STRIPE_KEY)

export async function POST() {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'eur',
    automatic_payment_methods: {
      enabled: true
    },
    //payment_method_types: ['card', 'sofort', 'sepa_debit']
  })

  return json({
    clientSecret: paymentIntent.client_secret
  })
}