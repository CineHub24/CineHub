import { db } from '$lib/server/db';
import { booking, film, showing, priceSet, seatCategory, ticketType, cinemaHall, user } from '$lib/server/db/schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { languageAwareRedirect } from '$lib/utils/languageAware';

export const load: PageServerLoad = async ({ locals, url }) => {
    // Fetch user information from locals
    if (!locals.user) {
        return fail(401, { error: 'Unauthorized' });
    }
    const user = locals.user;

    const showId = parseInt(url.pathname.split('/').pop() || '0', 10);
    try {
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
                priceFactor: priceSet.priceFactor,
            })
            .from(showing)
            .innerJoin(priceSet, eq(showing.priceSetId, priceSet.id))
            .where(eq(showing.id, <number>showId));

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
            user: user,
            show: show[0],
            seatCategories,
            hall: hall[0],
            priceSet: set[0],
        };
    } catch (e) {
        throw error(500, 'Internal Server Error');
    }
};

export const actions: Actions = {
    createBooking: async ({ request }) => {
        const formData = await request.formData();
        const userId = formData.get('userId');

        if(!userId) {
            throw error(400, 'Missing required fields');
        }

        let bookingId: number;

        try {
            // Create the booking entry
            [{ bookingId }] = await db.insert(booking).values({
                userId: <string>userId,
            }).returning({ bookingId: booking.id });
        } catch (e) {
            console.log(e)
            throw error(500, 'Failed to create booking');
        }

        return languageAwareRedirect(303, '/cart/' + bookingId)
    },
};
