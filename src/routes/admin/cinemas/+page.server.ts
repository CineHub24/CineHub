import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { cinema, cinemaHall, film, priceSet } from '$lib/server/db/schema';

export const load = async (event) => {

    const cinemas = await db.select().from(cinema)
    return{
        cinemas: cinemas,
    }

}
