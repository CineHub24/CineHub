import { db } from '$lib/server/db';
import { film } from '$lib/server/db/schema';
import { ilike, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';
import { fail } from '@sveltejs/kit';
export const load: PageServerLoad = async ({ params }) => {
	const searchTerm = params.searchTerm;
	try {
		const films = await db
			.select()
			.from(film)
			.where(
				or(
					ilike(film.title, `%${searchTerm}%`),
					ilike(film.description, `%${searchTerm}%`),
					ilike(film.director, `%${searchTerm}%`)
				)
			);

		return {
			success: true,
			films: films,
			searchTerm
		};
	} catch (error) {
		return fail(500, { error: 'Internal server error' });
	}
};
