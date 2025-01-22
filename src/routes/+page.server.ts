import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import type { Actions } from '@sveltejs/kit';
import { time } from 'console';
import { gte, asc, and, ne, eq } from 'drizzle-orm';

export const load = async (event) => {
	let preferredCinemaId = event.cookies.get('preferredCinema');

	if (!preferredCinemaId) {
		const cinemas = await db.select().from(table.cinema).orderBy(table.cinema.name);
		preferredCinemaId = cinemas[0].id;
	}

	const movies = await db.select().from(table.film);

	const shows = await db
		.select({
			id: table.showing.id,
			date: table.showing.date,
			time: table.showing.time,
			endTime: table.showing.endTime,
			filmid: table.showing.filmid,
			hallid: table.showing.hallid,
			cancelled: table.showing.cancelled,
			hallName: table.cinemaHall.name
		})
		.from(table.showing)
		.innerJoin(table.cinemaHall, eq(table.showing.hallid, table.cinemaHall.id))
		.where(
			and(
				gte(table.showing.date, new Date().toISOString()),
				ne(table.showing.cancelled, true),
				eq(table.cinemaHall.cinemaId, preferredCinemaId)
			)
		)
		.orderBy(asc(table.showing.date));

	const codes = await db.select().from(table.giftCodes).orderBy(table.giftCodes.amount);
	return {
		movies: movies,
		shows: shows,
		codes: codes
	};
};
export const actions = {
	addToCart: async ({ request, locals }) => {
		const formData = await request.formData();
		const giftCodeId = formData.get('giftCardId') as unknown as number;
		const giftCard = await db
			.select()
			.from(table.giftCodes)
			.where(eq(table.giftCodes.id, giftCodeId));

		console.log('giftCard', giftCard);

		let userBooking = await db
			.select()
			.from(table.booking)
			.where(and(eq(table.booking.userId, locals.user!.id), ne(table.booking.status, 'completed')));

		console.log('userBOoking', userBooking);
		if (userBooking.length == 0) {
			userBooking = await db
				.insert(table.booking)
				.values({
					userId: locals.user!.id
				})
				.returning();
		}

		console.log('userBooking', userBooking);	
		const currBooking = userBooking[0];

		await db
			.insert(table.giftCodesUsed)
			.values({ giftCodeId: giftCodeId, bookingId: currBooking.id });

		await db
			.update(table.booking)
			.set({ finalPrice: String(Number(currBooking.basePrice) + Number(giftCard[0].amount)) })
			.where(eq(table.booking.id, currBooking.id));

		languageAwareRedirect(303, '/cart');
	}
} satisfies Actions;
