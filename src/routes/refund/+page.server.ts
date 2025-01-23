import { db } from '$lib/server/db';
import {
	booking,
	film,
	priceDiscount,
	showing,
	ticket,
	ticketStatusEnum,
	discountTypesEnum
} from '$lib/server/db/schema';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, asc, and, sql, inArray } from 'drizzle-orm';
import { languageAwareRedirect } from '$lib/utils/languageAware.js';
import { generateUniqueCode } from '$lib/utils/randomCode.js';
import * as m from '$lib/paraglide/messages.js';

const dbFail = fail(500, { message: m.internal_server_error({}), database: true });

export const load = async ({ locals }) => {
	const localUser = locals.user;

	if (!localUser) {
		return languageAwareRedirect(301, '/login');
	}

	const refundableShows = await db
		.selectDistinct({
			showId: showing.id,
			filmTitle: film.title,
			date: showing.date,
			time: showing.time,
			ticketCount: sql<number>`count(${ticket.id})::int`,
			totalPrice: sql<number>`sum(${ticket.price})::numeric(10,2)`,
			ticketIds: sql<number[]>`array_agg(${ticket.id})`
		})
		.from(booking)
		.innerJoin(ticket, eq(ticket.bookingId, booking.id))
		.innerJoin(showing, eq(ticket.showingId, showing.id))
		.innerJoin(film, eq(showing.filmid, film.id))
		.where(
			and(
				eq(booking.userId, localUser.id),
				eq(showing.cancelled, true),
				eq(ticket.status, ticketStatusEnum.enumValues[1])
			)
		)
		.groupBy(showing.id, film.title, showing.date, showing.time);

	return {
		refundableShows
	};
};
export const actions: Actions = {
	bookNew: async ({ request }) => {
		const formData = await request.formData();
		let refundAmount = formData.get('totalPrice') as string;
		const ticketIds = formData.getAll('ticketIds') as unknown as number[];
		refundAmount = '10';

		if (!refundAmount) {
			return fail(400, { message: m.missing_inputs({}), missing: true });
		}
		const code = (await generateUniqueCode(6)) as string;
		try {
			const newDiscount = await db
				.insert(priceDiscount)
				.values({
					code: code,
					value: refundAmount,
					discountType: discountTypesEnum.enumValues[1],
					expiresAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 2).toISOString()
				})
				.returning({ code: priceDiscount.code });
			await db
				.update(ticket)
				.set({ status: ticketStatusEnum.enumValues[3] })
				.where(inArray(ticket.id, ticketIds));

			return {
				code: newDiscount[0].code,
				newCodeCreated: true,
				message: m.discount_code_created({})
			};
		} catch (e) {
			console.log(e);
			return dbFail;
		}
	}
} satisfies Actions;
