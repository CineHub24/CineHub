import { db } from '$lib/server/db';
import { cinema, cinemaHall, film, showing } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, asc, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load = async ({ cookies, url }) => {
	let preferredCinemaId = cookies.get('preferredCinema');

	if (!preferredCinemaId) {
		const cinemas = await db.select().from(cinema).orderBy(cinema.name);
		preferredCinemaId = cinemas[0].id.toString();
	}

	const id = parseInt(url.pathname.split('/').pop() || '0', 10);
	try {
		const movie = await db
			.select()
			.from(film)
			.where(eq(film.id, <number>id));
			const shows = await db
		.select({
			id: showing.id,
			date: showing.date,
			time: showing.time,
			endTime: showing.endTime,
			filmid: showing.filmid,
			hallid: showing.hallid,
			cancelled: showing.cancelled,
			hallName: cinemaHall.name,
		})
		.from(showing)
		.innerJoin(cinemaHall, eq(showing.hallid, cinemaHall.id))
		.where(
			and(
				gte(showing.date, new Date().toISOString()),
				ne(showing.cancelled, true),
				eq(cinemaHall.cinemaId, parseInt(preferredCinemaId)),
				eq(showing.filmid, id)
			)
		)
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
