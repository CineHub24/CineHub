import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { fail } from "@sveltejs/kit";
import * as m from '$lib/paraglide/messages.js';

export const load = async (event) => {
	try {
		const movies = await db.select().from(table.film);

	return {
		movies: movies
	};
	} catch (error) {
		return fail(500, { error: m.internal_server_error({}) });
		
	}
	
};
