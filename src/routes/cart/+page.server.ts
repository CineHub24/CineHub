import { db } from '$lib/server/db';
import {
	booking,
	film,
	priceDiscount,
	showing,
	ticket,
	seat,
	type Ticket,
	type Seat,
	type Showing,
	type Film
} from '$lib/server/db/schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, and, inArray } from 'drizzle-orm';


interface PriceCalculation {
	basePrice: number;
	discount: {
		value: number;
		discountType: 'percentage' | 'absolute';
	} | null;
	discountedAmount: number;
	vatRate: number;
	vatAmount: number;
	total: number;
}

async function calculatePrices(
	tickets: {
		Ticket: Ticket,
		Showing: Showing,
		Film: Film,
		seat: Seat,
	}[],
	discount: any | null
): Promise<PriceCalculation> {
	const vatRate = 0.19;
	const basePrice = tickets.reduce((sum, ticket) => sum + Number(ticket.Ticket.price), 0);
	let discountedPrice = basePrice;
	let discountedAmount = 0;

	if (discount) {
		if (discount.discountType === 'percentage') {
			discountedAmount = basePrice * Number(discount.value);
			discountedPrice = basePrice - discountedAmount;
		} else {
			discountedAmount = Number(discount.value);
			discountedPrice = Math.max(0, basePrice - discountedAmount);
		}
	}

	const vatAmount = discountedPrice * vatRate;
	console.log(discountedPrice);
	try {
		await db
			.update(booking)
			.set({
				basePrice: basePrice.toString(),
				finalPrice: discountedPrice.toString(),
				discountValue: discountedAmount.toString(),
				items: tickets.length
			})
			.where(eq(booking.id, Number(tickets[0].Ticket.bookingId)));
	} catch (error) {
		console.log(error);
	}
	return {
		basePrice,
		discount: discount
			? {
					value: discount.value,
					discountType: discount.discountType
				}
			: null,
		discountedAmount,
		vatRate,
		vatAmount,
		total: discountedPrice
	};
}

export const load = async ({ locals }) => {
	try {
		const userId = locals.user!.id;
		const _booking = await db.select().from(booking).where(eq(booking.userId, userId));
		const bookingId = _booking[0].id;
		const tickets = await db
			.select()
			.from(ticket)
			.innerJoin(seat, eq(seat.id, ticket.seatId))
			.innerJoin(showing, eq(showing.id, ticket.showingId))
			.innerJoin(film, eq(film.id, showing.filmid))
			.where(eq(ticket.bookingId, Number(bookingId)));
		if (showing === undefined) {
			return fail(404, { error: true, message: 'Showing not found' });
		}
		console.log(bookingId);
		console.log(tickets);
		// Calculate initial prices without discount
		let prices;
		if (
			_booking[0].basePrice === null ||
			_booking[0].finalPrice === null ||
			_booking[0].items !== tickets.length
		) {
			prices = await calculatePrices(tickets, null);
		} else {
			prices = {
				basePrice: Number(_booking[0].basePrice),
				discount: {
					value: Number(_booking[0].discountValue),
					discountType: 'none'
				},
				discountedAmount: Number(_booking[0].discountValue),
				vatRate: 0.19,
				vatAmount: Number(_booking[0].finalPrice) * 0.19,
				total: Number(_booking[0].finalPrice)
			};
		}
		return {
			booking: _booking[0],
			tickets,
			prices
		};
	} catch (error) {
		return fail(500, { error: 'Server error while loading cart' });
	}
};

export const actions = {
	discount: async ({ request, locals }) => {
		const data = await request.formData();
		const discountCode = data.get('discount-code') as string;

		try {
			const discount = await db
				.select()
				.from(priceDiscount)
				.where(
					and(
						eq(priceDiscount.code, discountCode),
						gte(priceDiscount.expiresAt, new Date().toISOString())
					)
				);

			if (discount.length === 0) {
				return fail(400, { error: 'Discount code not found or expired' });
			}

			// Get current booking's tickets to calculate new prices
			const userId = locals.user!.id;
			const _booking = await db.select().from(booking).where(eq(booking.userId, userId));
			const tickets = await db
			.select()
			.from(ticket)
			.innerJoin(seat, eq(seat.id, ticket.seatId))
			.innerJoin(showing, eq(showing.id, ticket.showingId))
			.innerJoin(film, eq(film.id, showing.filmid))
			.where(eq(ticket.bookingId, Number(_booking[0].id)));

			// Calculate new prices with discount
			const prices = await calculatePrices(tickets, discount[0]);

			return {
				success: 'Discount code applied successfully',
				discount: discount[0],
				prices
			};
		} catch (error) {
			console.log(error);
			return fail(500, { error: 'Server error while checking discount code' });
		}
	},
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const ticketId = data.get('ticketId') as string;

		try {
			await db.delete(ticket).where(eq(ticket.id, Number(ticketId)));
			await db
				.update(booking)
				.set({ basePrice: null, finalPrice: null, discountValue: null, items: null })
				.where(eq(booking.userId, locals.user!.id));
		} catch (error) {
			return fail(500, { error: 'Server error while deleting ticket' });
		}
	}
};
