import { db } from '$lib/server/db';
import { priceSet, seatCategory, ticketType } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';

export const load = async ({ url }) => {

    try {
        const priceSets = await db
            .select()
            .from(priceSet)
        const seatCategories = await db
            .select()
            .from(seatCategory)
        const ticketTypes = await db
            .select()
            .from(ticketType)
    
        return {
            priceSets,
            seatCategories,
            ticketTypes
    
        };
    }
    catch (e) {
        console.log(e);
        throw error(500, "Internal Server Error DB");
    }
}
export const actions = {
	// update: async ({ request, url }) => {
	// 	// Formular-Daten auslesen
	// 	// type title = typeof film.title.dataType
	// 	const formData = await request.formData();

	// 	// Einzelne Werte extrahieren
	// 	const titel = <string>formData.get('title');
	// 	const genre = [formData.get('genre') as string];
	// 	const runtimeString = formData.get('runtime') as string;
	// 	const director:string = <string>formData.get("director")
    //     const description:string = <string>formData.get("description")
	// 	let id = <unknown>url.pathname.replace('/admin/films/film/', '');

	// 	let runtime: number | null = null;
	// 	if (/^\d+$/.test(runtimeString)) {
	// 		runtime = Number(runtimeString);
	// 	} else {
	// 		throw error(400, 'Ungültige Eingabe');
	// 	}

        
	// 	// Typsicherheit und Validierung
	// 	if (typeof titel !== film.title.dataType || titel.length === 0) {
	// 		console.log('Ungültiger Titel:', titel);
	// 	}
	// 	if (!Array.isArray(genre) || genre.length === 0) {
	// 		console.log('Ungültiges Genre:', genre);
	// 	}
	// 	if ( typeof runtime !== film.runtime.dataType||runtime === null || runtime < 0) {
			
	// 		console.log('Ungültige Laufzeit:', runtime);
	// 	}
	// 	if (typeof director !== film.director.dataType || director.length === 0) {
	// 		console.log('Ungültiger Regisseur:', director);
	// 	}
	// 	if (typeof description !== film.description.dataType || description.length === 0) {
	// 		console.log('Ungültige Beschreibung:', description);
	// 	}
		
		
	// 	// Hier würden Sie normalerweise die Daten in der Datenbank speichern
	// 	console.log('Empfangene Daten:', {
	// 		titel,
	// 		genre,
    //         runtime,
    //         description
	// 	});
	// 	try{
	// 	await db.update(film).set({genres: genre,title: titel, runtime:runtime, description:description, director:director}).where(eq(film.id, <number>id))
	// 	} catch(e)
	// 	{
	// 		console.log(e);
	// 		throw error(500, 'Failed to update film');
	// 	}
	// 	// Optional: Erfolgsrückmeldung zurückgeben
	// }
} satisfies Actions;