import { db } from '$lib/server/db';
import {
	booking,
	discountTypesEnum,
	giftCodes,
	giftCodesUsed,
	priceDiscount,
	showing,
	ticket,
	type PriceDiscountForInsert
} from '$lib/server/db/schema';
import { LogLevel, logToDB } from '$lib/utils/dbLogger';
import { EmailService } from '$lib/utils/emailService';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { generateUniqueCode } from '$lib/utils/randomCode';
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
					userId: locals.user!.id
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


		const codesToBuy = await db
			.select({
				amount: giftCodes.amount
			})
			.from(giftCodesUsed)
			.innerJoin(giftCodes, eq(giftCodes.id, giftCodesUsed.giftCodeId))
			.where(inArray(giftCodesUsed.id, giftCodesUsedIdsArray.map((id) => Number(id))));
			
		const newDiscounts: PriceDiscountForInsert[] = [];
		for (let code of codesToBuy) {
			const newCode = (await generateUniqueCode(6)) as string;
			newDiscounts.push({
				code: newCode,
				value: code.amount,
				discountType: discountTypesEnum.enumValues[1],
				expiresAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365).toISOString()
			});
		}
		if (newDiscounts.length > 0) {
			const newPriceDiscountIDs = await db
				.insert(priceDiscount)
				.values(newDiscounts)
				.returning({ id: priceDiscount.id });
			newPriceDiscountIDs.map(async (discount) => {
				await db
					.update(giftCodesUsed)
					.set({ priceDiscountId: discount.id })
					.where(eq(giftCodesUsed.bookingId, Number(bookingId)));
			});
		}
		await handleBookingDiscount(Number(bookingId));

		await db
			.update(booking)
			.set({
				status: 'completed',
				date: new Date().toISOString().split('T')[0],
				time: new Date().toTimeString().split(' ')[0]
			})
			.where(eq(booking.id, Number(bookingId)));
	
			try {
			await emailClient.sendBookingConfirmation(Number(bookingId), locals.user!.email as string);
			} catch (e) {
				console.error(e);
			}
	} catch (e) {
		console.error(e);
		return fail(500, { error: 'Internal Server Error' });
	}
	return languageAwareRedirect(302, '/booking/' + bookingId);
}

async function handleBookingDiscount(bookingId: number) {
	// Hole Booking mit Discount
	const bookingWithDiscount = await db
		.select({
			booking: booking,
			discount: priceDiscount
		})
		.from(booking)
		.leftJoin(priceDiscount, eq(booking.discount, priceDiscount.id))
		.where(eq(booking.id, bookingId));
	if (!bookingWithDiscount[0]?.discount) {
		return;
	}

	// Prüfe ob es sich um einen Geschenkgutschein handelt
	const giftCard = await db
		.select()
		.from(giftCodesUsed)
		.innerJoin(giftCodes, eq(giftCodes.id, giftCodesUsed.giftCodeId))
		.where(
			and(
				eq(giftCodesUsed.priceDiscountId, bookingWithDiscount[0].discount.id),
				eq(giftCodesUsed.claimed, false)
			)
		);

	if (giftCard.length > 0) {
		const basePrice = Number(bookingWithDiscount[0].booking.basePrice);
		const remainingValue =
			Number(giftCard[0].giftCodes.amount) - Number(giftCard[0].giftCodesUsed.claimedValue);

		if (remainingValue > 0) {
			const discountedAmount = Math.min(remainingValue, basePrice);
			const newClaimedValue = Number(giftCard[0].giftCodesUsed.claimedValue) + discountedAmount;
			const isFullyClaimed = newClaimedValue >= Number(giftCard[0].giftCodes.amount);

			await db
				.update(giftCodesUsed)
				.set({
					claimedValue: String(newClaimedValue),
					claimed: isFullyClaimed
				})
				.where(eq(giftCodesUsed.id, giftCard[0].giftCodesUsed.id));
		}
	}
}
