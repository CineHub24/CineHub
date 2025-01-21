import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { booking } from '$lib/server/db/schema';
import {
    booking,
    film,
    priceDiscount,
    showing,
    ticket,
    seat,
    type Ticket,
    type Seat,
    type Showing,
    type Film,
    priceSet,
    ticketType,
    seatCategory,
    type PriceSet,
    type TicketType,
    type SeatCategory,
    giftCodes,
    giftCodesUsed
} from '$lib/server/db/schema';
import { eq, lt, gte, ne, and, inArray, not } from 'drizzle-orm';


export const load = async ({ locals }) => {
    if (!locals.user) {
        return languageAwareRedirect(301, '/login');
    }
    try {
        const userId = locals.user!.id;
        const _booking = await db
            .select()
            .from(booking)
            .where(and(eq(booking.userId, userId), ne(booking.status, 'completed')));

        if (_booking.length === 0) {
            return {
                booking: null,
                tickets: [],
                prices: {
                    basePrice: 0,
                    discount: null,
                    discountedAmount: 0,
                    giftCodeAmount: 0,
                    vatRate: 0.19,
                    vatAmount: 0,
                    total: 0
                },
                giftCodes: []
            };
        }

        const bookingId = _booking[0].id;

        const tickets = await db
            .select({
                ticket: ticket,
            })
            .from(ticket)
            .innerJoin(showing, eq(showing.id, ticket.showingId))
            .where(eq(ticket.bookingId, Number(bookingId)));

        if (tickets.length === 0) {
            return {};
        }



        // get oldest ticket
        const oldestTicket = tickets.reduce((oldest, ticket) => {
            if (!oldest) return ticket;
            return ticket.ticket.createdAt! < oldest.ticket.createdAt! ? ticket : oldest;
        });


        // Add a 15-minute buffer for booking time (or adjust as needed)
        const BOOKING_WINDOW_MINUTES = 15;
        const currentTime = new Date();
        const timeUntilShowing = Math.max(0, oldestTicket.ticket.createdAt!.getTime() + BOOKING_WINDOW_MINUTES - currentTime.getTime());
        const remainingBookingTime = Math.floor(timeUntilShowing / 1000);

        // If the showing is in the past or too close to start time
        if (remainingBookingTime <= 0) {
            throw error(400, 'Booking window has closed for this showing');
        }

        return {
            timeLeft: remainingBookingTime,
            bookingWindowMinutes: BOOKING_WINDOW_MINUTES
        };
    } catch (err) {
        console.error('Error in load function:', err);
        throw error(500, 'Failed to load showing details');
    }
};