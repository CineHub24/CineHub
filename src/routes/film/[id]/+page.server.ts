import { db } from '$lib/server/db';
import { film, showing } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, asc, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
export const load = async ({ url }) => {
	const id = parseInt(url.pathname.split('/').pop() || '0', 10);
	try {
		const movie = await db
			.select()
			.from(film)
			.where(eq(film.id, <number>id));
		const shows = await db
			.select()
			.from(showing)
			.where(and(eq(showing.filmid, <number>id), gte(showing.date, new Date().toISOString()), eq(showing.cancelled, false)))
			.orderBy(asc(showing.date));

		return {
			movie: movie[0],
			shows: shows
		};
	} catch (e) {
		console.log(e);
		return fail(500, { error: 'Failed to load film' });
	}
};
