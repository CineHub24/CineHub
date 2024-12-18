import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { gt, asc } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const movies = await db.select().from(table.film);

	const shows = await db.select()
  .from(table.showing)
  .where(gt(table.showing.date, new Date().toISOString())) // Filter where showing.date is greater than today.
  .orderBy(asc(table.showing.date));

	return {
		movies: movies,
    shows: shows
	};
};
