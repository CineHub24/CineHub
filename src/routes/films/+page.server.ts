import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { gte, asc, and, ne, eq } from 'drizzle-orm';

export const load = async (event) => {
	const movies = await db.select().from(table.film);

	return {
		movies: movies,
	};
};
