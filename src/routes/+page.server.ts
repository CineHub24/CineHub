import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { gte, asc, and, ne } from 'drizzle-orm';

export const load = async () => {
	const movies = await db.select().from(table.film);

	const shows = await db
		.select()
		.from(table.showing)
		.where(
			and(
				gte(table.showing.date, new Date().toISOString()), 
				ne(table.showing.cancelled, true))
		)
		.orderBy(asc(table.showing.date));

	return {
		movies: movies,
		shows: shows
	};
};
