import { db } from '$lib/server/db';
import { seat, cinemaHall, seatCategory, showing, ticket, ticketType, booking } from '$lib/server/db/schema';
import { eq, inArray, sql, and } from 'drizzle-orm';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../../$types';



type SeatType = typeof seat.$inferSelect;

type Seat = SeatType & { booked?: boolean }

type SeatCategory = typeof seatCategory.$inferSelect;
interface SeatResponse {
    seat: Seat;
    seatCategory: SeatCategory;
}

type Showing = typeof showing.$inferSelect;

type CinemaHall = typeof cinemaHall.$inferSelect;

type Ticket = typeof ticket.$inferSelect;

type SeatGrid = (SeatResponse | null)[][];

export const actions = {
} satisfies Actions;



export const load: PageServerLoad = async ({ params, locals }) => {
    const userId = locals.user!.id

    const _booking = await db.select().from(booking).where(eq(booking.userId, userId));

    const bookingId = _booking[0].id;

    const tickets = await db.select().from(ticket).where(eq(ticket.bookingId, Number(bookingId)));

    //get showings from the tickets
    const showings = await db.select().from(showing).where(inArray(showing.id, tickets.map(ticket => ticket.showingId)));

    //const hall = (await db.select().from(cinemaHall).where(eq(cinemaHall.id, _showing.hallid!)))[0];


    if (showing === undefined) {
        return fail(404, { error: true, message: 'Showing not found' });
    }

    return {
        showing: showings[0],
        tickets,
    };
};
