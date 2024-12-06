import { db } from '$lib/server/db';
import { film, showing } from '$lib/server/db/schema';
import type { Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, sql } from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/mysql-core';
export const load = async ({ url }) => {
	console.log(url.pathname);
	let id = <unknown>url.pathname.replace('/adminv2/films/film/', '');
	console.log(id);
	const movies = await db
		.select()
		.from(film)
		.where(eq(film.id, <number>id));
	const shows  = await db
	.select()
	.from(showing).leftJoin(film,eq(showing.filmid,film.id)).where(eq(showing.filmid, <number>id))

	return {
		filme: movies,
		shows: shows
	};
};

export const actions = {
	update: async ({ request, url }) => {
		// Formular-Daten auslesen
		const formData = await request.formData();

		// Einzelne Werte extrahieren
		const titel:string = <string>formData.get('title');
		const genre:string = <string>formData.get('genre');
        const runtime:string = <string>formData.get('runtime')
        const director:string = <string>formData.get("director")
        const description:string = <string>formData.get("description")
		let id = <unknown>url.pathname.replace('/adminv2/films/film/', '');
		console.log(id);
		console.log(titel);
        //TODO: Checks einbauen damit nur veränderte Werte erkannt werden
		// Typsicherheit und Validierung
		if (typeof titel !== 'string' || typeof genre !== 'string') {
			return {
				status: 400,
				body: { message: 'Ungültige Eingabe' }
			};
		}

		// Hier würden Sie normalerweise die Daten in der Datenbank speichern
		console.log('Empfangene Daten:', {
			titel,
			genre,
            runtime,
            description
		});
		await db.update(film).set({genre: genre,title: titel, runtime:runtime, description:description, director:director}).where(eq(film.id, <number>id))

		// Optional: Erfolgsrückmeldung zurückgeben
	},

	create: async ({url, request}) => {
		let id = <unknown>url.pathname.replace('/adminv2/films/film/', '');
		const formData = await request.formData()
		let date = formData.get('date') as string;
		let timeString = formData.get('time') as string;
		
		try{
			// await db.insert(showing).values({date: date, time:timeString, filmid:id as number})
			await db.insert(showing).values({date: date, time: timeString,filmid: id as number, endTime: sql`(${timeString}::time + (SELECT (runtime || ' minutes')::interval FROM ${film} WHERE id =${id as number} ))`
  })
		} catch(e){
			console.log(e)
		}


	}
} satisfies Actions;
