import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { film } from '$lib/server/db/schema';

export const load = async (event) => {
	try {
		const movies = await db.select().from(film);
		return {
			movies: movies
		};
	} catch (error) {
        console.log(error);
        return fail(500, { error: 'Failed to load movies' });
    }
};
