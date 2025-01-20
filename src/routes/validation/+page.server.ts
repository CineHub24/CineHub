// src/routes/scanner/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	cinemaHall,
	film,
	seat,
	seatCategory,
	showing,
	ticket,
	ticketType
} from '$lib/server/db/schema';

export const actions = {
	validate: async ({ request }) => {
		try {
			const data = await request.formData();
			const ticketToken = data.get('ticketData')?.toString();

			if (!ticketToken) {
				return fail(400, {
					error: 'Ungültiger Ticket-Code'
				});
			}

			// Suche das Ticket in der Datenbank anhand des Tokens
			const foundTicket = await db
				.select({
					id: ticket.id,
					type: ticketType.name,
					status: ticket.status,
					film: film.title,
					datum: showing.date,
					uhrzeit: showing.time,
					saal: cinemaHall.name,
					row: seat.row,
					number: seat.seatNumber,
					category: seatCategory.name
				})
				.from(ticket)
				.innerJoin(ticketType, eq(ticket.type, ticketType.id))
				.innerJoin(showing, eq(ticket.showingId, showing.id))
				.innerJoin(cinemaHall, eq(showing.hallid, cinemaHall.id))
				.innerJoin(film, eq(showing.filmid, film.id))
				.innerJoin(seat, eq(ticket.seatId, seat.id))
				.innerJoin(seatCategory, eq(seat.categoryId, seatCategory.id))
				.where(eq(ticket.token, ticketToken));

			if (!foundTicket) {
				return fail(400, {
					error: 'Ticket nicht gefunden'
				});
			}
			if (foundTicket[0].status === 'validated') {
				return fail(400, {
					error: 'Ticket wurde bereits verwendet'
				});
			}
			if (foundTicket[0].status === 'reserved') {
				return fail(400, { error: 'Ticket wurde noch nicht bezahlt' });
			}

			// if (now > new Date(foundTicket.startTime.getTime() + 30 * 60000)) {
			// 	return fail(400, {
			// 		error: 'Einlass nur bis 30 Minuten vor und nach Vorstellungsbeginn'
			// 	});
			// }

			// Ticket als verwendet markieren
			const updatedTicket = await db
				.update(ticket)
				.set({ status: 'validated' })
				.where(eq(ticket.id, foundTicket[0].id));
			return {
				success: true,
				message: `Ticket gültig - Saal ${foundTicket[0].saal}}`,
				ticket: {
					id: foundTicket[0].id,
					type: foundTicket[0].type,
					film: foundTicket[0].film,
					datum: foundTicket[0].datum,
					uhrzeit: foundTicket[0].uhrzeit,
					saal: foundTicket[0].saal,
					sitz: foundTicket[0].row + foundTicket[0].number,
					category: foundTicket[0].category
				}
			};
		} catch (error) {
			console.error('Fehler bei der Ticket-Validierung:', error);
			return fail(500, {
				error: 'Ein interner Fehler ist aufgetreten'
			});
		}
	}
} satisfies Actions;
