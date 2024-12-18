import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { cinema, cinemaHall, film, priceSet } from '$lib/server/db/schema';

export const load = async (event) => {

    const movies = await db.select().from(film)
    const halls = await db.select().from(cinemaHall).leftJoin(cinema,eq(cinema.id,cinemaHall.cinemaId))
    const priceSets = await db.select().from(priceSet)
    console.log(halls)
    return{
        movies: movies,
        halls: halls,
        priceSets: priceSets
    }

}
