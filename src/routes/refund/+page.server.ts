import { db } from '$lib/server/db';
import { booking, film, showing, ticket } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, asc, and, sql } from 'drizzle-orm';
import { languageAwareRedirect } from '$lib/utils/languageAware.js';

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
			totalPrice: sql<number>`sum(${ticket.price})::numeric(10,2)`
		})
		.from(booking)
		.innerJoin(ticket, eq(ticket.bookingId, booking.id))
		.innerJoin(showing, eq(ticket.showingId, showing.id))
		.innerJoin(film, eq(showing.filmid, film.id))
		.where(and(eq(booking.userId, localUser.id), eq(showing.cancelled, true)))
		.groupBy(showing.id, film.title, showing.date, showing.time);


	return {
		refundableShows
	};
};
export const actions: Actions = {  
    refund: async ({ request, url }) => {
        //TODO: Grant Refund
    },
	bookNew: async ({ request, url }) => {
		//TODO: Book New Ticket with refundAmount as discount
	}
} satisfies Actions;
