import { db } from '$lib/server/db';
import { booking, film, priceDiscount, showing, ticket, ticketStatusEnum, discountTypesEnum } from '$lib/server/db/schema';
import { error, fail, type Actions } from '@sveltejs/kit';
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
	refund: async ({ request }) => {
		//TODO: Grant Refund

		const formData = await request.formData();
		let ticketIds = formData.getAll('ticketIds') as unknown as number[];

		console.log(ticketIds);

		console.log('Refund Requested');
		try{
			await db
				.update(ticket)
				.set({ status: ticketStatusEnum.enumValues[3] })
				.where(inArray(ticket.id, ticketIds));
		}
		catch(e){
			console.log(e);
			return dbFail;
		}
	},
	bookNew: async ({ request }) => {
		//TODO: Book New Ticket with refundAmount as discount

		const formData = await request.formData();
		const refundAmount = formData.get('totalPrice') as unknown as number;
		

		const code = await generateUniqueCode();


		try {
			const newPrice = await db
				.insert(priceDiscount)
				.values({
					code: code,
					value: refundAmount,
					discountType: discountTypesEnum.enumValues[1]
				})
				.returning();
			console.log(newPrice);
			languageAwareRedirect(301, '/');
		}
		catch(e){
			console.log(e);
			return dbFail;
		}

	}
} satisfies Actions;
