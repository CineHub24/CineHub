import { db } from '$lib/server/db';
import { booking, giftCodesUsed, showing, ticket } from '$lib/server/db/schema';
import { LogLevel, logToDB } from '$lib/utils/dbLogger';
import { EmailService } from '$lib/utils/emailService';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { fail, redirect } from '@sveltejs/kit';
import { and, eq, inArray, ne, sql } from 'drizzle-orm';
import Stripe from 'stripe';

const SECRET_STRIPE_KEY = import.meta.env.VITE_SECRET_STRIPE_KEY;

const stripe = new Stripe(SECRET_STRIPE_KEY);

export async function load(event) {
	const url = new URL(event.request.url);
	const locals = event.locals;
	const sessionId = url.searchParams.get('session_id');
	if (!sessionId) {
		return fail(400, { error: 'Checkout Session ID ist erforderlich' });
	}

	const session = await stripe.checkout.sessions.retrieve(sessionId);

	if (session.payment_status != 'paid') {
		console.log('User did not pay yet');
		return languageAwareRedirect(302, '/cart/checkout');
	}

	const bookingId = session.metadata!.booking_id;
	const ticketIds = session.metadata!.tickets;
	const giftCodesUsedIds = session.metadata!.giftcodes;

	console.log('[Stripe Metadata] BookingID: ' + bookingId);
	console.log('[Stripe Metadata] Tickets: ' + ticketIds);

	try {
		const gmailUser = import.meta.env.VITE_GMAIL_USER;
		const gmailAppPassword = import.meta.env.VITE_GMAIL_APP_PASSWORD;
		const emailClient = new EmailService(gmailUser, gmailAppPassword);

		const ticketIdsArray = ticketIds.split(' ').map(Number);
		const giftCodesUsedIdsArray = giftCodesUsedIds.split(' ');

		const updatedTickets = await db
			.update(ticket)
			.set({ status: 'paid' })
			.where(inArray(ticket.id, ticketIdsArray))
			.returning();

		if (updatedTickets.length > 0) {
			await db
				.update(showing)
				.set({ soldTickets: sql`${showing.soldTickets} + ${updatedTickets.length}` })
				.where(eq(showing.id, Number(updatedTickets[0].showingId)));
		}

		// Move tickets that are part of the booking but were left unpaid to a new booking
		const unpaidTickets = await db
			.select()
			.from(ticket)
			.where(and(eq(ticket.bookingId, <number>(<unknown>bookingId)), ne(ticket.status, 'paid')));
		// At least one ticket was not paid successfully
		if (unpaidTickets.length > 0) {
			// Create new booking
			const newBookings = await db
				.insert(booking)
				.values({
					userId: locals.user.id
				})
				.returning();
			await logToDB(LogLevel.INFO, 'Created new cart after payment', event);
			const userBooking = newBookings[0];

			// Update bookingId to newly created booking
			await db
				.update(ticket)
				.set({ bookingId: userBooking.id })
				.where(and(eq(ticket.bookingId, Number(bookingId)), ne(ticket.status, 'paid')));
		}

		// ToDo: Mika is updating this coding to run the proper backend logic for price discounts
		// await db
		// 	.update(giftCodesUsed)
		// 	.set({ claimed: true })
		// 	.where(inArray(giftCodesUsed.id, giftCodesUsedIdsArray));

		await db
			.update(booking)
			.set({
				status: 'completed',
				date: new Date().toISOString().split('T')[0],
				time: new Date().toTimeString().split(' ')[0]
			})
			.where(eq(booking.id, Number(bookingId)));

		await emailClient.sendBookingConfirmation(Number(bookingId), locals.user.email as string);
	} catch (e) {
		console.error(e);
		return fail(500, { error: 'Internal Server Error' });
	}
	return languageAwareRedirect(302, '/booking/' + bookingId);
}
