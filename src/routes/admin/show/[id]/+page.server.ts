import { goto } from '$app/navigation';
import { db } from '$lib/server/db';
import { film, priceSet, showing } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { get } from 'svelte/store';

function getID(url: URL) { 
	const id = parseInt(url.pathname.split('/').pop() ?? '0', 10);
	return id as number;
}

export const load = async ({ url }) => {

	const show = await db
		.select({ date: showing.date, time: showing.time, endTime: showing.endTime, filmid: film.id, film_name: film.title, priceSet: showing.priceSetId })
		.from(showing)
		.leftJoin(film, eq(showing.filmid, film.id))
		.where(eq(showing.id, getID(url)));

	const priceSets = await db
		.select()
		.from(priceSet);
	return {
		show: show[0],
		priceSets: priceSets
	};
};

export const actions = {
	update: async ({ request, url }) => {
		// Formular-Daten auslesen
		const formData = await request.formData();
		// Einzelne Werte extrahieren

		let date = formData.get('date') as string;
		let timeString = formData.get('time') as string;
		let priceSetId = formData.get('priceSet') as unknown as number;

		try {
			await db
				.update(showing)
				.set({ date: date, time: timeString, priceSetId: priceSetId })
				.where(eq(showing.id, getID(url)));
		} catch (e) {
			console.log('Fehler' + e);
		}
		// Optional: Erfolgsrückmeldung zurückgeben
	},
	delete: async ({url}) =>{
		
		try{
			await db.delete(showing).where(eq(showing.id,getID(url)))
		} catch(e){
			console.log("error" + e)
		}
	}
} satisfies Actions;
