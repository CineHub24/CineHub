import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { gte, asc, and, ne, eq } from 'drizzle-orm';

export const load = async (event) => {
	const preferredCinemaId = event.cookies.get('preferredCinema');

	const movies = await db.select().from(table.film);

	const shows = await db
		.select()
		.from(table.showing)
		.innerJoin(table.cinemaHall, eq(table.showing.hallid, table.cinemaHall.id))
		.where(
			and(
				gte(table.showing.date, new Date().toISOString()),
				ne(table.showing.cancelled, true),
				eq(table.cinemaHall.cinemaId, preferredCinemaId)
			)
		)
		.orderBy(asc(table.showing.date));

	const showsFiltered = [];
	for (const show of shows) {
		showsFiltered.push(show.Showing);
	}
	return {
		movies: movies,
		shows: showsFiltered
	};
};
