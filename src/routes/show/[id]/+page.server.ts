import { db } from '$lib/server/db';
import { film, showing, priceSet, seatCategory, ticketType, cinemaHall } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';

export const load = async ({ url }) => {
    const showId = parseInt(url.pathname.split('/').pop() || '0', 10);
    try{
        const show = await db
            .select({
                id: showing.id,
                date: showing.date,
                time: showing.time,
                endTime: showing.endTime,
                hallid: showing.hallid,
                filmid: showing.filmid,
                priceSetId: showing.priceSetId,
                cancelled: showing.cancelled,
                title: film.title,
                backdrop: film.backdrop, 
                poster: film.poster,
                movieTitle: film.title, 
                description: film.description,
                year: film.year,
            })
            .from(showing)
            .innerJoin(film, eq(showing.filmid, film.id))
            .where(eq(showing.id, <number>showId));
        const set = await db
            .select({
                id: priceSet.id,
                seatCategoryPrices: priceSet.seatCategoryPrices,
                priceFactor: priceSet.priceFactor
            })
            .from(showing)
            .innerJoin(priceSet, eq(showing.priceSetId, priceSet.id))
            .where(eq(showing.id, <number>showId))
        const seatCategories = [];
        for (let i = 0; i < set[0].seatCategoryPrices.length; i++) {
            const category = await db
                .select()
                .from(seatCategory)
                .where(eq(seatCategory.id, set[0].seatCategoryPrices[i]));
            seatCategories.push(category[0]);
        }
        const hall = await db
            .select()
            .from(cinemaHall)
            .where(eq(cinemaHall.id, <number>show[0].hallid));
        return {
            show: show[0],
            seatCategories,
            hall: hall[0],
            priceSet: set[0]
        }
    }
    catch(e){
        throw error(500, "Internal Server Error");
    }
};