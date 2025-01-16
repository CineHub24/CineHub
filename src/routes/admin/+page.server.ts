import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import {
	cinema,
	cinemaHall,
	film,
	priceSet,
	seatCategory,
	type SeatCategory
} from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { standard } from '$lib/paraglide/messages';

export const load = async (event) => {
	try {
		const seatCategories = await db.select().from(seatCategory).orderBy(seatCategory.price);
		if (seatCategories.length === 0) {
			const standardSeat: SeatCategory = {
				id: 0,
				name: 'Regular Seat',
				description: 'Standard',
				color: '#ff0000',
				width: 40,
				height: 40,
				price: '10',
				customPath: 'M 0 0 h 40 v 40 h -40 Z',
                isActive: true,
                createdAt: new Date(),
			};

			await db.insert(seatCategory).values(standardSeat);
		}
		const movies = await db.select().from(film);
		const halls = await db
			.select()
			.from(cinemaHall)
			.leftJoin(cinema, eq(cinema.id, cinemaHall.cinemaId));
		const priceSets = await db.select().from(priceSet);
		return {
			movies: movies,
			halls: halls,
			priceSets: priceSets
		};
	} catch (error) {
		console.log(error);
		return fail(500, { error: 'Failed to load movies' });
	}
};
