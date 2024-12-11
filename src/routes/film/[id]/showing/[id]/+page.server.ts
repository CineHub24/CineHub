import { db } from '$lib/server/db';
import { film, showing, priceSet, seatCategory, ticketType, cinemaHall } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';

export const load = async ({ url }) => {
    let tmp = url.pathname.split('/');

    const movieId = tmp[2];
    const showingId = tmp[4];

    try{
        const movie = await db
            .select()
            .from(film)
            .where(eq(film.id, parseInt(movieId, 10)));
        const show  = await db
            .select()
            .from(showing)
            .innerJoin(priceSet,eq(showing.priceSetId, priceSet.id))
            .where(eq(showing.id, parseInt(showingId, 10)))

        const seatCategories = [];
        const ticketTypes = [];
        for (let i = 0; i < show[0].PriceSet.seatCategoryPrices.length; i++) {
            const category = await db
                .select()
                .from(seatCategory)
                .where(eq(seatCategory.id, show[0].PriceSet.seatCategoryPrices[i]));
            seatCategories.push(category[0]);
        }
        const hall = await db
            .select()
            .from(cinemaHall)
            .where(eq(cinemaHall.id, <number>show[0].Showing.hallid));

        return {
            movie: movie[0],
            show: show[0],
            seatCategories,
            hall: hall[0]
        }
        // const set = await db
        //     .select()
        //     .from(priceSet)
        //     .where(eq(priceSet.id, shows[0].priceSetId));
    }
    catch(e){
        throw error(500, "Internal Server Error DB");
    }
};