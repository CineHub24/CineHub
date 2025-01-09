import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { film } from '$lib/server/db/schema';
import * as m from '$lib/paraglide/messages.js';

export const load = async (event) => {
	try {
		const movies = await db.select().from(film);
		return {
			movies: movies
		};
	} catch (error) {
        console.log(error);
        return fail(500, { error: m.internal_server_error({}) });
    }
};
