import type { PageServerLoad } from './$types';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { db } from '$lib/server/db';
import {
	booking,
	cinemaHall,
	film,
	seat,
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
			showingId: showing.id
		})
		.from(ticket)
		.innerJoin(ticketType, eq(ticket.type, ticketType.id))
		.innerJoin(showing, eq(ticket.showingId, showing.id))
		.innerJoin(cinemaHall, eq(showing.hallid, cinemaHall.id))
		.innerJoin(film, eq(showing.filmid, film.id))
		.innerJoin(booking, eq(ticket.bookingId, booking.id))
		.innerJoin(user, eq(booking.userId, user.id))
		.innerJoin(seat, eq(ticket.seatId, seat.id))
		.where(and(eq(user.id, event.locals.user.id), ne(ticket.status, 'validated')))
		.orderBy(showing.date);
	return { tickets: tickets };
};

function generateMockTickets(count: number) {
	const mockTickets = [];
	const films = ['The Matrix', 'Inception', 'Interstellar', 'The Dark Knight'];
	const statuses = ['paid', 'reserved'];
	const $types = ['adult', 'child', 'student', 'senior'];
	for (let i = 1; i <= count; i++) {
		const showingId = Math.floor(i / 3) + 1;
		// Group tickets by showing
		mockTickets.push({
			id: i,
			token: `token${i}`,
			type: $types[Math.floor(Math.random() * $types.length)],
			status: statuses[Math.floor(Math.random() * statuses.length)],
			price: Math.floor(Math.random() * 15) + 5,
			// Random price between 5 and 20
			sitzreihe: String.fromCharCode(65 + Math.floor(i / 10)),
			// A, B, C, ...
			sitzplatz: (i % 10) + 1,
			film: films[Math.floor(Math.random() * films.length)],
			datum: new Date(2023, 5, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
			uhrzeit: `${Math.floor(Math.random() * 12) + 12}:${Math.floor(Math.random() * 60)
				.toString()
				.padStart(2, '0')}`,
			saal: `Saal ${Math.floor(Math.random() * 5) + 1}`,
			showingId: showingId
		});
	}
	return mockTickets;
}
