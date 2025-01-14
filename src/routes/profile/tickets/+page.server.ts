import type { PageServerLoad } from './$types';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { db } from '$lib/server/db';
import {
	booking,
	cinemaHall,
	film,
	seat,
	seatCategory,
	showing,
	ticket,
	ticketType,
	user
} from '$lib/server/db/schema';
import { and, eq, ne } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	// Fetch user information from locals
	if (!event.locals.user) {
		return languageAwareRedirect(301, '/login');
	}

	//load tickets
	const tickets = await db
		.select({
			id: ticket.id,
			token: ticket.token,
			type: ticketType.name,
			status: ticket.status,
			price: ticket.price,
			sitzreihe: seat.row,
			sitzplatz: seat.seatNumber,
			film: film.title,
			datum: showing.date,
			uhrzeit: showing.time,
			saal: cinemaHall.name,
			showingId: showing.id,
			seatCategory: seatCategory.name
		})
		.from(ticket)
		.innerJoin(ticketType, eq(ticket.type, ticketType.id))
		.innerJoin(showing, eq(ticket.showingId, showing.id))
		.innerJoin(cinemaHall, eq(showing.hallid, cinemaHall.id))
		.innerJoin(film, eq(showing.filmid, film.id))
		.innerJoin(booking, eq(ticket.bookingId, booking.id))
		.innerJoin(user, eq(booking.userId, user.id))
		.innerJoin(seat, eq(ticket.seatId, seat.id))
		.innerJoin(seatCategory, eq(seat.categoryId, seatCategory.id))
		.where(and(eq(user.id, event.locals.user.id), eq(ticket.status, 'paid')))
		.orderBy(showing.date);
	return { tickets: tickets };
};
