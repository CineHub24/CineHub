import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import type { Actions } from '@sveltejs/kit';
import { time } from 'console';
import { gte, asc, and, ne, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load = async (event) => {
	let preferredCinemaId = event.cookies.get('preferredCinema');

	if (!preferredCinemaId) {
		const cinemas = await db.select().from(table.cinema).orderBy(table.cinema.name);
		preferredCinemaId = cinemas[0].id;
	}
	try {
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
	} catch (error) {
		return fail(500, { error: 'Internal Server Error' });
	}
};
export const actions = {
	addToCart: async ({ request, locals }) => {
		const formData = await request.formData();
		const giftCodeId = formData.get('giftCardId') as unknown as number;

		try {
			const giftCard = await db
				.select()
				.from(table.giftCodes)
				.where(eq(table.giftCodes.id, giftCodeId));

			let userBooking = await db
				.select()
				.from(table.booking)
				.where(
					and(eq(table.booking.userId, locals.user!.id), ne(table.booking.status, 'completed'))
				);
			if (userBooking.length == 0) {
				userBooking = await db
					.insert(table.booking)
					.values({
						userId: locals.user!.id
					})
					.returning();
			}
			const currBooking = userBooking[0];

			await db
				.insert(table.giftCodesUsed)
				.values({ giftCodeId: giftCodeId, bookingId: currBooking.id });

			await db
				.update(table.booking)
				.set({ finalPrice: currBooking.basePrice + giftCard[0].amount })
				.where(eq(table.booking.id, currBooking.id));

			languageAwareRedirect(303, '/cart');
		} catch (error) {
			return fail(500, { error: 'Internal Server Error' });
		}
	}
} satisfies Actions;
