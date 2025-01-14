import { db } from '$lib/server/db';
import { ticket, seat, cinemaHall, cinema, showing, film, booking, seatCategory, ticketType } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    // Check if user is logged in
    if (!event.locals.user) {
        throw error(401, 'Unauthorized');
    }

    const user = event.locals.user;

    try {
        // Fetch user's bookings
        const bookings = await db
            .select({
                finalPrice: booking.finalPrice,
                ticketId: ticket.id,
                showingDate: showing.date,
                showingTime: showing.time,
                movieTitle: film.title,
                cinemaName: cinema.name,
                hallName: cinemaHall.name,
                seatRow: seat.row,
                seatNumber: seat.seatNumber,
                ticketTypeName: ticketType.name,
                ticketStatus: ticket.status,
            })
            .from(ticket)
            .leftJoin(seat, eq(ticket.seatId, seat.id))
            .leftJoin(seatCategory, eq(seat.categoryId, seatCategory.id))
            .leftJoin(ticketType, eq(ticket.type, ticketType.id))
            .leftJoin(cinemaHall, eq(seat.cinemaHall, cinemaHall.id))
            .leftJoin(cinema, eq(cinemaHall.cinemaId, cinema.id))
            .leftJoin(showing, eq(ticket.showingId, showing.id))
            .leftJoin(film, eq(showing.filmid, film.id))
            .leftJoin(booking, eq(ticket.bookingId, booking.id))
            .where(eq(booking.userId, user.id))
            .orderBy(showing.date, showing.time);
        return {
            bookings
        };
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return fail(500, { error: 'Internal Server Error' } );
    }
};