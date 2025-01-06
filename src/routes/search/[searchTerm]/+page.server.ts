import { db } from '$lib/server/db';
import { film } from '$lib/server/db/schema';
import { ilike, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params }) => {
	const searchTerm = params.searchTerm;

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
		films: films,
		searchTerm
	};
};
