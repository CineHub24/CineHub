import { db } from '$lib/server/db';
import { film, showing } from '$lib/server/db/schema';
import type { Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ url }) => {
	console.log(url.pathname);
	let id = <unknown>url.pathname.replace('/adminv2/films/show/', '');
	console.log(id);
	const show = await db
		.select({ date: showing.date, time: showing.time, filmid: film.id, film_name: film.title })
		.from(showing)
		.leftJoin(film, eq(showing.filmid, film.id))
		.where(eq(showing.id, <number>id));
	console.log(show[0]);
	return {
		show: show[0]
	};
};

export const actions = {
	update: async ({ request, url }) => {
		// Formular-Daten auslesen
		const formData = await request.formData();
		let id = <unknown>url.pathname.replace('/adminv2/films/show/', '');
		// Einzelne Werte extrahieren

		let date = formData.get('date') as string;

		let timeString = formData.get('time') as string;


		try {
			await db
				.update(showing)
				.set({ date: date, time: timeString })
				.where(eq(showing.id, id as number));
		} catch (e) {
			console.log('Fehler' + e);
		}
		// Optional: Erfolgsrückmeldung zurückgeben
	}
} satisfies Actions;
