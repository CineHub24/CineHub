import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { booking, ticket } from '$lib/server/db/schema';
import { eq, ne, and } from 'drizzle-orm';

export async function GET({ locals }) {
    if (!locals.user) {
        return json({ timeLeft: null });
    }

    try {
        const userId = locals.user.id;
        const _booking = await db
            .select()
            .from(booking)
            .where(and(
                eq(booking.userId, userId),
                ne(booking.status, 'completed')
            ));

        if (_booking.length === 0) {
            return json({ timeLeft: null });
        }

        const bookingId = _booking[0].id;

        const tickets = await db
            .select({
                ticket: ticket,
            })
            .from(ticket)
            .where(eq(ticket.bookingId, bookingId));

        if (tickets.length === 0) {
            return json({ timeLeft: null });
        }



        // get oldest ticket
        const oldestTicket = tickets.reduce((oldest, ticket) => {
            if (!oldest) return ticket;
            return ticket.ticket.createdAt! < oldest.ticket.createdAt! ? ticket : oldest;
        });

        console.log('Oldest ticket createdAt:', oldestTicket.ticket.createdAt);


        // Calculate remaining time
        const BOOKING_WINDOW_MINUTES = 15;
        const currentTime = new Date();
        const timeUntilShowing = oldestTicket.ticket.createdAt!.getTime() + BOOKING_WINDOW_MINUTES * 60000 - currentTime.getTime();

        console.log('Current time:', currentTime);
        console.log('Time until showing:', timeUntilShowing);
        const remainingBookingTime = Math.floor(timeUntilShowing / 1000);

        console.log('Remaining booking time:', remainingBookingTime);

        return json({
            timeLeft: remainingBookingTime > 0 ? remainingBookingTime : null
        });
    } catch (err) {
        console.error('Error in cart timer endpoint:', err);
        throw error(500, 'Failed to load cart timer data');
    }
}