// src/routes/scanner/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	cinemaHall,
	seat,
	showing,
	ticket,
	type Showing,
	type Ticket
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
				.select()
				.from(ticket)
				.innerJoin(seat, eq(seat.id, ticket.seatId))
				.where(eq(ticket.token, ticketToken));
			const show = await db
				.select()
				.from(showing)
				.innerJoin(cinemaHall, eq(cinemaHall.id, showing.hallid))
				.where(eq(showing.id, foundTicket[0]?.Ticket.showingId ?? 0));

			if (!foundTicket) {
				return fail(400, {
					error: 'Ticket nicht gefunden'
				});
			}
			if (foundTicket[0].Ticket.status === 'validated') {
				return fail(400, {
					error: 'Ticket wurde bereits verwendet'
				});
			}
            if (foundTicket[0].Ticket.status === 'reserved') {
                return fail(400, { error: 'Ticket wurde noch nicht bezahlt' });
            }

			// Prüfe ob das Ticket für diese Vorstellung ist
			// const now = new Date().getTime();
			// if (now < Number(show[0].Showing.time)) {
			//     return fail(400, {
			//         error: 'Vorstellung hat noch nicht begonnen'
			//     });
			// }

			// if (now > new Date(foundTicket.showing.startTime.getTime() + 30 * 60000)) {
			//     return fail(400, {
			//         error: 'Einlass nur bis 30 Minuten nach Vorstellungsbeginn'
			//     });
			// }

			// Ticket als verwendet markieren
			const updatedTicket = await db
				.update(ticket)
				.set({
					status: 'validated'
				})
				.where(eq(ticket.id, foundTicket[0].Ticket.id))
				.returning();

			return {
				success: true,
				message: `Ticket gültig - Saal ${show[0].CinemaHall.name}, Sitz: Reihe ${foundTicket[0].seat.row} Platz ${foundTicket[0].seat.seatNumber}`,
				ticket: updatedTicket[0]
			};
		} catch (error) {
			console.error('Fehler bei der Ticket-Validierung:', error);
			return fail(500, {
				error: 'Ein interner Fehler ist aufgetreten'
			});
		}
	}
} satisfies Actions;
