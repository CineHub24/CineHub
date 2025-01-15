import { db } from '$lib/server/db';
import { eq, ne, and } from 'drizzle-orm';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import {
    booking,
	cinema,
	cinemaHall,
	film,
	priceDiscount,
	priceSet,
	giftCodes,
    giftCodesUsed
} from '$lib/server/db/schema';
import { fail, type Actions } from '@sveltejs/kit';

export const load = async (event) => {
    const codes = await db.select().from(giftCodes).orderBy(giftCodes.amount);
    return {
        codes: codes
    }
}

export const actions = {
    addToCart: async ({ request, locals }) => {

        const formData = await request.formData();
        const giftCodeId = formData.get('giftCardId') as unknown as number;

        let bookings = await db.select().from(booking).where(and(eq(booking.userId, locals.user!.id), ne(booking.status, "completed")));
        if (bookings.length == 0) {
            const bookings = await db.insert(booking).values({
                userId: locals.user!.id,                               
            }).returning();
        }
        const currBooking = bookings[0];

        await db
            .insert(giftCodesUsed)
            .values({giftCodeId: giftCodeId, bookingId: currBooking.id})

        languageAwareRedirect(303, '/cart');
    }

} satisfies Actions;