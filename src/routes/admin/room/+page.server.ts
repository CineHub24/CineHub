import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { cinema, cinemaHall } from '$lib/server/db/schema';

export const load = async (event) => {

    const halls = await db.select().from(cinemaHall).leftJoin(cinema,eq(cinema.id,cinemaHall.cinemaId))   
    return{
        halls: halls,
    }

}
