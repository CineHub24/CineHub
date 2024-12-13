import { db } from '$lib/server/db';
import { film, showing, priceSet, seatCategory, ticketType, cinemaHall } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';

export const load = async ({ url }) => {
    const priceSets = await db
            .select()
            .from(priceSet)


    return {
        priceSets
    };
}