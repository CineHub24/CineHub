// fetch matching Tickets (ticket.bookingId = bookingId) from DB => tickets can be shown on their on in the checkout windows

// add method that calculates the total price based on the singular tickets and the applied discount (read from booking table)

import { db } from '$lib/server/db';
import { booking } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ locals }) => {
    const userId = locals.user!.id

    const foundBookings = await db.select().from(booking).where(eq(booking.userId, userId));

    if(foundBookings.length == 0) {
        return fail(400)
    }

    return {
        booking: foundBookings[0],
    };
};