import { db } from '$lib/server/db'
import { booking, ticket } from '$lib/server/db/schema'
import { fail } from '@sveltejs/kit'
import { and, eq, ne } from 'drizzle-orm'
import Stripe from 'stripe'
const SECRET_STRIPE_KEY = import.meta.env.VITE_SECRET_STRIPE_KEY
const DOMAIN = import.meta.env.VITE_DOMAIN

const stripe = new Stripe(SECRET_STRIPE_KEY)
const return_url = new URL(
  '/cart/checkout/verify?session_id={CHECKOUT_SESSION_ID}',
  DOMAIN
).toString()

export async function load({ locals }) {
  const userId = locals.user!.id;
  const _bookings = await db.select().from(booking).where(and(eq(booking.userId, userId), ne(booking.status, 'completed')));
  console.log(_bookings);
  if (_bookings.length == 0) {
    return fail(500, { error: 'No current booking found' })
  }

  const currentBooking = _bookings[0];

  const bookingId = currentBooking.id;

  const _tickets = await db.select().from(ticket).where(eq(ticket.bookingId, bookingId));

  if (_tickets.length == 0) {
    return fail(500, { error: 'No tickets selected' })
  }

  let ticketIds: string[] = [];
  for (var tckt of _tickets) {
    ticketIds.push(<string><unknown>tckt.id)
  }

  let finalPrice = <string>currentBooking.finalPrice;
  const splittedPrice = finalPrice.split(".");
  if (splittedPrice?.length > 1) {
    const suffix = splittedPrice[1];
    if (suffix.length == 1) {
      finalPrice += '0';
    }
  } else {
    finalPrice += '00';
  }

  console.log('Price in cents: ' + finalPrice)

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [
      {
        price_data: {
            product_data: {
                name: 'Tickets',
                tax_code: 'txcd_20030000',
            },
            currency: 'eur',
            unit_amount: <number><unknown>finalPrice?.replace(".", ""),
        },
        quantity: 1,
      }
    ],
    metadata: {
      "booking_id": bookingId,
      "tickets": ticketIds.join(' '),
    },
    mode: 'payment',
    return_url
  })

  return {
    clientSecret: session.client_secret
  }
}