import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { cinema, cinemaHall, film, priceSet } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

export const load = async (event) => {
    try {
        const movies = await db.select().from(film)
        const halls = await db.select().from(cinemaHall).leftJoin(cinema,eq(cinema.id,cinemaHall.cinemaId))
        const priceSets = await db.select().from(priceSet)
        // console.log("printing halls")
        // console.log(halls)
        return{
            movies: movies,
            halls: halls,
            priceSets: priceSets
        }  
    } catch (error) {
        console.log(error);
        return fail(500, { error: 'Failed to load movies' });
    }
    

}
