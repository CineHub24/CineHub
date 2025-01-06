import { db } from '$lib/server/db';
import { booking, film, priceDiscount, showing, ticket } from '$lib/server/db/schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, and, inArray } from 'drizzle-orm';

export const load = async ({ locals }) => {
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
        showing: showings,
        booking: _booking[0],
        tickets,
    };
};

export const actions = {

    discount: async ({ request }) => {

        const data = await request.formData();
        const discountCode = data.get('discount-code') as string;
        try {
            const discount = await db.select().from(priceDiscount).where(and(eq(priceDiscount.code, discountCode), gte(priceDiscount.expiresAt, new Date().toISOString())));
            if (discount.length === 0) {
                return fail(400, { error: 'Discount code not found or expired' });
            } else {
                console.log(discount[0]);
                return {
                    success: `Discount code applied successfully`,
                    discount: discount[0]
                }
            }
        } catch (error) {
            console.log(error);
            return fail(500, { error: 'Server error while checking discount code' });
        }
    }
}