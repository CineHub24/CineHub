import { db } from '$lib/server/db';
import { cinemaHall, film, priceSet, showing } from '$lib/server/db/schema';
import { languageAwareRedirect } from '$lib/utils/languageAware.js';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, sql, and } from 'drizzle-orm';
import { date } from 'drizzle-orm/mysql-core';
import { fail } from '@sveltejs/kit';
import { getFreeTimeSlots } from '$lib/utils/timeSlots.js';
export type freeSlots = {
	start: string;
	end: string;
	date: string;
	hallid: number;
	priceSetId: number;
};
export type Film = typeof film.$inferSelect;
export type Showing = typeof showing.$inferSelect;
export type CinemaHall = typeof cinemaHall.$inferSelect;

export const load = async ({ url }) => {
	const id = parseInt(url.pathname.split('/').pop() || '0', 10);
	const movies: Film[] = await db
		.select({
			id: film.id,
			imdbID: film.imdbID,
			tmdbID: film.tmdbID,
			backdrop: film.backdrop,
			title: film.title,
			genres: film.genres,
			director: film.director,
			runtime: film.runtime,
			ageRating: film.ageRating,
			poster: film.poster,
			description: film.description,
			year: film.year
		})
		.from(film)
		.where(eq(film.id, <number>id));
	const shows = await db
		.select()
		.from(showing)
		.where(eq(showing.filmid, <number>id));

	const halls = await db.select().from(cinemaHall);
	const priceSets = await db.select().from(priceSet);
	return {
		film: movies[0] as Film,
		shows: shows,
		halls: halls,
		priceSets: priceSets
	};
};

export const actions = {
	delete: async ({ request, url }) => {
		const id = parseInt(url.pathname.split('/').pop() ?? '0', 10);
		try {
			await db.delete(film).where(eq(film.id, id));
		} catch (e) {
			console.log(e);
			return fail(500, { error: 'Failed to delete film' });
		}
		return languageAwareRedirect(302, '/admin/films');
	},

	update: async ({ request, url }) => {
		// Formular-Daten auslesen

		const formData = await request.formData();

		// Einzelne Werte extrahieren
		const titel = <string>formData.get('title');
		const genre = (formData.get('genre') as string).split(',').map((item) => item.trim());
		const runtimeString = formData.get('runtime') as string;
		const director: string = <string>formData.get('director');
		const description: string = <string>formData.get('description');
		const id = parseInt(url.pathname.split('/').pop() ?? '0', 10);

		let runtime: number | null = null;
		if (/^\d+$/.test(runtimeString)) {
			runtime = Number(runtimeString);
		} else {
			return fail(400, { error: 'Invalid runtime' });
		}

		// Typsicherheit und Validierung
		if (typeof titel !== film.title.dataType || titel.length === 0) {
			console.log('Ungültiger Titel:', titel);
		}
		if (!Array.isArray(genre) || genre.length === 0) {
			console.log('Ungültiges Genre:', genre);
		}
		if (typeof runtime !== film.runtime.dataType || runtime === null || runtime < 0) {
			console.log('Ungültige Laufzeit:', runtime);
		}
		if (typeof director !== film.director.dataType || director.length === 0) {
			console.log('Ungültiger Regisseur:', director);
		}
		if (typeof description !== film.description.dataType || description.length === 0) {
			console.log('Ungültige Beschreibung:', description);
		}

		try {
			await db
				.update(film)
				.set({
					genres: genre,
					title: titel,
					runtime: runtime,
					description: description,
					director: director
				})
				.where(eq(film.id, <number>id));
			return { success: 'Film erfolgreich aktualisiert' };
		} catch (e) {
			console.log(e);
			return fail(500, { error: 'Server error while updating film' });
		}
		// Optional: Erfolgsrückmeldung zurückgeben
	},

	create: async ({ url, request }) => {
		const id = parseInt(url.pathname.split('/').pop() ?? '0', 10);
		const formData = await request.formData();
		let date = formData.get('date') as string;
		let timeString = formData.get('time') as string;
		let hall = formData.get('hall') as unknown as number;
		let priceSetId = formData.get('priceSet') as unknown as number;
		try {
			const filmRuntime = await db
				.select({ runtime: film.runtime })
				.from(film)
				.where(eq(film.id, id as number))
				.limit(1);
			const { runtime } = filmRuntime[0];
			let freeSlots = await getFreeTimeSlots(
				db, // Drizzle Datenbank-Instanz
				hall, // Saal-ID
				priceSetId,
				date, // Datum
				runtime as number, // Filmdauer in Minuten
				15, // Standard 15 Minuten Reinigung
				15 // Standard 15 Minuten Werbung
			);
			for (const slot of freeSlots) {
				console.log(`Freier Slot: ${slot.start} - ${slot.end}`);
			}
			return {
				slots: freeSlots
			};
		} catch (error) {
			console.log(error);
			return fail(500, { error: 'Failed to create showing' });
		}
	},
	save: async ({ request, url }) => {
		const formData = await request.formData();
		let date = formData.get('date') as string;
		let start = formData.get('slotStart') as string;
		let end = formData.get('slotEnd') as string;
		let hall = formData.get('hall') as unknown as number;
		let filmId = formData.get('filmId') as unknown as number;
		let priceSet = formData.get('priceSet') as unknown as number;

		console.log(priceSet);

		try {
			await db.insert(showing).values({
				hallid: hall,
				date: date,
				time: start,
				filmid: filmId,
				endTime: end,
				priceSetId: priceSet,
				cancelled: false
			});
			return { success: 'Showing successfully saved' };
		} catch (e) {
			return fail(500, { error: 'Failed to save showing' });
		}
	}
} satisfies Actions;
