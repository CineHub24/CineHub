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
	type Film,
	priceSet,
	ticketType,
	seatCategory,
	type PriceSet,
	type TicketType,
	type SeatCategory,
	giftCodes,
	giftCodesUsed,
	type PriceDiscountForInsert
} from '$lib/server/db/schema';
import type { Decimal } from '@prisma/client/runtime/library';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { error, fail, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, and, inArray, not } from 'drizzle-orm';
import * as m from '$lib/paraglide/messages.js';
import { LogLevel, logToDB } from '$lib/utils/dbLogger';

// Updated interface to match database structure
interface TicketData {
	ticket: Ticket;
	showing: Showing;
	film: Film;
	seat: Seat;
}

interface PriceCalculation {
	basePrice: number;
	discount: {
		value: number;
		discountType: 'percentage' | 'absolute';
	} | null;
	discountedAmount: number;
	giftCodeAmount: number;
	vatRate: number;
	vatAmount: number;
	total: number;
}

async function calculatePrices(
	bookingId: number,
	tickets: TicketData[],
	discount: any | null,
	giftCards: (typeof giftCodes.$inferSelect)[]
): Promise<PriceCalculation> {
	const vatRate = 0.19;
	const basePrice = tickets.reduce((sum, ticket) => sum + Number(ticket.ticket.price), 0);
	let discountedPrice = basePrice;
	let discountedAmount = 0;

	const giftCodeAmount = giftCards.reduce((sum, code) => sum + Number(code.amount), 0);

	if (discount) {
		// Prüfe zuerst, ob es sich um einen Geschenkgutschein handelt
		const giftCard = await db
			.select()
			.from(giftCodesUsed)
			.where(and(eq(giftCodesUsed.priceDiscountId, discount.id), eq(giftCodesUsed.claimed, false)));

		if (giftCard.length > 0) {
			// Es ist ein Geschenkgutschein - berechne den verbleibenden Wert
			const remainingValue = Number(discount.value) - Number(giftCard[0].claimedValue);

			if (remainingValue > 0) {
				// Nutze nur den noch verfügbaren Betrag
				discountedAmount = Math.min(remainingValue, basePrice);
				discountedPrice = basePrice - discountedAmount;
			} else {
				// Kein Guthaben mehr verfügbar
				discountedAmount = 0;
				discountedPrice = basePrice;
			}
		} else {
			if (discount.discountType === 'percentage') {
				discountedAmount = basePrice * Number(discount.value);
				discountedPrice = basePrice - discountedAmount;
			} else {
				discountedAmount = Number(discount.value);
				discountedPrice = Math.max(0, basePrice - discountedAmount);
			}
		}
	}

	const totalWithGiftCodes = discountedPrice + giftCodeAmount;
	const vatAmount = totalWithGiftCodes * vatRate;

	try {
		await db
			.update(booking)
			.set({
				basePrice: basePrice.toString(),
				finalPrice: totalWithGiftCodes.toString(),
				discountValue: discountedAmount.toString(),
				items: tickets.length + giftCards.length,
				discount: discount ? discount.id : null
			})
			.where(eq(booking.id, bookingId));
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
		giftCodeAmount,
		vatRate,
		vatAmount,
		total: totalWithGiftCodes
	};
}

export const load = async ({ locals }) => {
	if (!locals.user) {
		return languageAwareRedirect(301, '/login');
	}
	try {
		const userId = locals.user!.id;
		const _booking = await db
			.select()
			.from(booking)
			.where(and(eq(booking.userId, userId), ne(booking.status, 'completed')));

		if (_booking.length === 0) {
			return {
				booking: null,
				tickets: [],
				prices: {
					basePrice: 0,
					discount: null,
					discountedAmount: 0,
					giftCodeAmount: 0,
					vatRate: 0.19,
					vatAmount: 0,
					total: 0
				},
				giftCodes: []
			};
		}

		const bookingId = _booking[0].id;

		const tickets = await db
			.select({
				ticket: ticket,
				seat: seat,
				showing: showing,
				film: film,
				priceSet: priceSet,
				ticketType: ticketType,
				seatCategory: seatCategory
			})
			.from(ticket)
			.innerJoin(seat, eq(seat.id, ticket.seatId))
			.innerJoin(showing, eq(showing.id, ticket.showingId))
			.innerJoin(film, eq(film.id, showing.filmid))
			.innerJoin(priceSet, eq(priceSet.id, showing.priceSetId))
			.innerJoin(ticketType, eq(ticketType.id, ticket.type))
			.innerJoin(seatCategory, eq(seatCategory.id, seat.categoryId))
			.where(eq(ticket.bookingId, Number(bookingId)));

		const giftCards = await db
			.select({
				id: giftCodes.id,
				amount: giftCodes.amount,
				description: giftCodes.description
			})
			.from(giftCodesUsed)
			.innerJoin(giftCodes, eq(giftCodes.id, giftCodesUsed.giftCodeId))
			.where(and(eq(giftCodesUsed.bookingId, bookingId), eq(giftCodesUsed.claimed, false)));

		const giftCodeAmount = giftCards.reduce((sum, code) => sum + Number(code.amount), 0);

		console.log('booking discount: ', _booking[0].discount);	

		let discount: PriceDiscountForInsert[] = [];
		if(_booking[0].discount) {
			discount = await db
				.select()
				.from(priceDiscount)
				.where(
					and(
						eq(priceDiscount.id, _booking[0].discount),
						gte(priceDiscount.expiresAt, new Date().toISOString()),
					)
				);
		}

		console.log('discount: ', discount);
		console.log('length', discount.length === 0 ? null: discount);

		let prices;
		if (
			_booking[0].basePrice === null ||
			_booking[0].finalPrice === null ||
			_booking[0].items !== tickets.length + giftCards.length
		) {
			const ticketData: TicketData[] = tickets.map((t) => ({
				ticket: t.ticket,
				showing: t.showing,
				film: t.film,
				seat: t.seat
			}));
			prices = await calculatePrices(bookingId, ticketData, (discount.length === 0 ? null: discount[0]) , giftCards);
		} else {
			const storedDiscountValue = Number(_booking[0].discountValue) || 0;
			prices = {
				basePrice: Number(_booking[0].basePrice),
				discount:
					storedDiscountValue > 0
						? {
								value: storedDiscountValue,
								discountType: 'none'
							}
						: null,
				discountedAmount: storedDiscountValue,
				giftCodeAmount: giftCodeAmount,
				vatRate: 0.19,
				vatAmount: Number(_booking[0].finalPrice) * 0.19,
				total: Number(_booking[0].finalPrice)
			};
		}
		console.log('booking: ', _booking[0]);
		console.log('tickets: ', tickets);
		console.log('prices: ', prices);
		console.log('giftCodes: ', giftCards);

		return {
			booking: _booking[0],
			tickets,
			prices,
			giftCodes: giftCards
		};
	} catch (error) {
		console.log(error);
		return fail(500, { error: 'Server error while loading cart' });
	}
};

export const actions = {
	discount: async ({ request, locals }) => {
		const data = await request.formData();
		const discountCode = data.get('discount-code') as string;

		try {
			const userId = locals.user!.id;
			const _booking = await db
				.select()
				.from(booking)
				.where(and(eq(booking.userId, userId), ne(booking.status, 'completed')));

			const discount = await db
				.select({
					priceDiscount,
					giftCodesUsed
				})
				.from(priceDiscount)
				.leftJoin(giftCodesUsed, eq(priceDiscount.id, giftCodesUsed.priceDiscountId))
				.where(
					and(
						eq(priceDiscount.code, discountCode),
						gte(priceDiscount.expiresAt, new Date().toISOString())
					)
				);

			if (
				discount.length === 0 ||
				(discount[0].giftCodesUsed && discount[0].giftCodesUsed?.claimed)
			) {
				return fail(400, { error: m.discount_not_found({}) });
			}
			if (discount[0].giftCodesUsed && discount[0].giftCodesUsed?.claimed) {
				return fail(400, { error: m.discount_not_found({}) });
			}

			const tickets = await db
				.select({
					ticket: ticket,
					seat: seat,
					showing: showing,
					film: film
				})
				.from(ticket)
				.innerJoin(seat, eq(seat.id, ticket.seatId))
				.innerJoin(showing, eq(showing.id, ticket.showingId))
				.innerJoin(film, eq(film.id, showing.filmid))
				.where(eq(ticket.bookingId, Number(_booking[0].id)));

			const giftCards = await db
				.select({
					id: giftCodes.id,
					amount: giftCodes.amount,
					description: giftCodes.description
				})
				.from(giftCodesUsed)
				.innerJoin(giftCodes, eq(giftCodes.id, giftCodesUsed.giftCodeId))
				.where(and(eq(giftCodesUsed.bookingId, _booking[0].id), eq(giftCodesUsed.claimed, false)));

			const ticketData: TicketData[] = tickets.map((t) => ({
				ticket: t.ticket,
				showing: t.showing,
				film: t.film,
				seat: t.seat
			}));

			const prices = await calculatePrices(
				_booking[0].id,
				ticketData,
				discount[0].priceDiscount,
				giftCards
			);
			return {
				success: m.discount_applied({}),
				discount: discount[0].priceDiscount,
				prices
			};
		} catch (error) {
			console.log(error);
			return fail(500, { error: m.server_error_discount({}) });
		}
	},
	delete: async (event) => {
		const request = event.request;
		const locals = event.locals;
		const data = await request.formData();
		const ticketId = data.get('ticketId') as string | null;
		const giftCodeId = data.get('giftCodeId') as string | null;

		console.log('ticketId: ', ticketId);

		try {
			if (ticketId) {
				await db.delete(ticket).where(eq(ticket.id, Number(ticketId)));
				await logToDB(
					LogLevel.INFO,
					"Deleted ticket with id " + ticketId,	
					event
				);
			} else if (giftCodeId) {
				await db.delete(giftCodesUsed).where(eq(giftCodesUsed.giftCodeId, Number(giftCodeId)));
				await logToDB(
					LogLevel.INFO,
					"Deleted gift code used with id " + giftCodeId,	
					event
				);
			} else {
				return fail(400, { error: m.no_valid_id({}) });
			}

			// Refresh booking data
			await db
				.update(booking)
				.set({ basePrice: null, finalPrice: null, discountValue: null, items: null })
				.where(and(eq(booking.userId, locals.user!.id), ne(booking.status, 'completed')));

			return { success: `${ticketId ? m.ticket({}) : m.gift_code({})} ${m.deleted({})}` };
		} catch (error) {
			console.error(error);
			return fail(500, { error: m.server_error_delete({}) });
		}
	}
};
