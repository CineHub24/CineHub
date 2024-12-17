import { db } from '$lib/server/db';
import { cinemaHall, film, showing } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, sql, and } from 'drizzle-orm';
import { date } from 'drizzle-orm/mysql-core';
export type freeSlots ={
	 start: string; end: string; date:string; hallid: number; 
};
export type Film = typeof film.$inferSelect;
export type Showing = typeof showing.$inferSelect;
export type CinemaHall = typeof cinemaHall.$inferSelect;


export const load = async ({ url }) => {
	console.log(url.pathname);
	let id = <unknown>url.pathname.replace('/admin/films/film/', '');
	console.log(id);
	const movies: Film[] = await db
		.select({
			id: film.id,
			imdbID: film.imdbID,
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
	const shows  = await db
	.select()
	.from(showing).where(eq(showing.filmid, <number>id))
		
	const halls = await db.select().from(cinemaHall);
	return {
		
		film: movies[0] as Film,
		shows: shows,
		halls: halls
		
	};
};

export const actions = {
	update: async ({ request, url }) => {
		// Formular-Daten auslesen
		// type title = typeof film.title.dataType
		const formData = await request.formData();

		// Einzelne Werte extrahieren
		const titel = <string>formData.get('title');
		const genre = [formData.get('genre') as string];
		const runtimeString = formData.get('runtime') as string;
		const director:string = <string>formData.get("director")
        const description:string = <string>formData.get("description")
		let id = <unknown>url.pathname.replace('/admin/films/film/', '');

		let runtime: number | null = null;
		if (/^\d+$/.test(runtimeString)) {
			runtime = Number(runtimeString);
		} else {
			throw error(400, 'Ungültige Eingabe');
		}

        
		// Typsicherheit und Validierung
		if (typeof titel !== film.title.dataType || titel.length === 0) {
			console.log('Ungültiger Titel:', titel);
		}
		if (!Array.isArray(genre) || genre.length === 0) {
			console.log('Ungültiges Genre:', genre);
		}
		if ( typeof runtime !== film.runtime.dataType||runtime === null || runtime < 0) {
			
			console.log('Ungültige Laufzeit:', runtime);
		}
		if (typeof director !== film.director.dataType || director.length === 0) {
			console.log('Ungültiger Regisseur:', director);
		}
		if (typeof description !== film.description.dataType || description.length === 0) {
			console.log('Ungültige Beschreibung:', description);
		}
		
		
		// Hier würden Sie normalerweise die Daten in der Datenbank speichern
		console.log('Empfangene Daten:', {
			titel,
			genre,
            runtime,
            description
		});
		try{
		await db.update(film).set({genres: genre,title: titel, runtime:runtime, description:description, director:director}).where(eq(film.id, <number>id))
		} catch(e)
		{
			console.log(e);
			throw error(500, 'Failed to update film');
		}
		// Optional: Erfolgsrückmeldung zurückgeben
	},

	create: async ({url, request}) => {
		let id = <unknown>url.pathname.replace('/admin/films/film/', '');
		const formData = await request.formData()
		let date = formData.get('date') as string;
		let timeString = formData.get('time') as string;
		let hall = formData.get('hall') as unknown as number;

		const filmRuntime = await db.select({runtime: film
			.runtime
		}).from(film).where(eq(film.id, id as number)).limit(1);
		const {runtime} = filmRuntime[0]
		 let freeSlots = await getFreeTimeSlots(
			db,               // Drizzle Datenbank-Instanz
			hall,                // Saal-ID
			date,       // Datum
			runtime as number,               // Filmdauer in Minuten
			15,                // Standard 15 Minuten Reinigung
			15                 // Standard 15 Minuten Werbung
		  )
		  for (const slot of freeSlots) {
			console.log(`Freier Slot: ${slot.start} - ${slot.end}`)
		  }
		  return {
			slots:freeSlots
		  }
	
	},
	save: async ({request, url}) => {

		const formData = await request.formData()
		let date = formData.get('date') as string;
		let start = formData.get('slotStart') as string;
		let end = formData.get('slotEnd') as string;
		let hall = formData.get('hall') as unknown as number;
		let filmId = formData.get('filmId') as unknown as number;


		try{
			await db.insert(showing).values({hallid: hall ,date: date, time: start,filmid: filmId, endTime: end})
		} catch(e){
			throw error(500, 'Failed to save showing');
		}
	}	
} satisfies Actions;

const getFreeTimeSlots = async (
	database: typeof db, 
	hallId: number, 
	filmDate: string, 
	filmDuration: number, 
	cleaningTime: number = 15,    
	advertisementTime: number = 15 
  ) => {
	const totalSlotDuration = filmDuration + cleaningTime + advertisementTime
  
	const existingShowings = await db.select()
	  .from(showing)
	  .where(
		and(
		  eq(showing.hallid, hallId),
		  eq(showing.date, filmDate)
		)
	  )
	  .orderBy(showing.time)
  
	const freeSlots = []
	const cinemaOpenTime = '08:00'
	const cinemaCloseTime = '24:00'
  
	// Generiere mögliche Startzeitpunkte (volle und halbe Stunden)
	const generatePossibleStartTimes = () => {
	  const times = []
	  const start = new Date(`1970-01-01T${cinemaOpenTime}`)
	  const end = new Date(`1970-01-01T${cinemaCloseTime}`)
  
	  while (start < end) {
		times.push(start.toTimeString().slice(0, 5))
		
		// Volle Stunde
		const fullHour = new Date(start)
		fullHour.setHours(fullHour.getHours() + 1, 0, 0, 0)
		
		// Halbe Stunde
		const halfHour = new Date(start)
		halfHour.setHours(halfHour.getHours(), 30, 0, 0)
  
		times.push(fullHour.toTimeString().slice(0, 5))
		times.push(halfHour.toTimeString().slice(0, 5))
  
		start.setHours(start.getHours() + 1)
	  }
  
	  return times.filter(time => time >= cinemaOpenTime && time < cinemaCloseTime)
	}
  
	const possibleStartTimes = generatePossibleStartTimes()
  
	// Prüfe jeden möglichen Startzeitpunkt
	for (const startTime of possibleStartTimes) {
	  const endTime = calculateEndTime(startTime, totalSlotDuration)
  
	// Prüfe, ob der Slot mit keiner Vorstellung kollidiert
	const isSlotFree = !existingShowings.some(show => 
		(show.time !== null && startTime >= show.time && show.endTime !== null && startTime < show.endTime) ||
		(show.time !== null && endTime > show.time && show.endTime !== null && endTime <= show.endTime) ||
		(show.time !== null && startTime <= show.time && show.endTime !== null && endTime >= show.endTime)
	)
  
	  if (isSlotFree) {
		freeSlots.push({
		  start: startTime,
		  end: endTime,
		  date: filmDate,
		  hallid: hallId
		})
	  }
	}
	
	return freeSlots
  }
  
  function calculateTimeDifference(start: string, end: string): number {
	const startTime = new Date(`1970-01-01T${start}`)
	const endTime = new Date(`1970-01-01T${end}`)
	return (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  }
  
  function calculateEndTime(startTime: string, durationInMinutes: number): string {
	const start = new Date(`1970-01-01T${startTime}`)
	const end = new Date(start.getTime() + durationInMinutes * 60000)
	
	return end.toTimeString().slice(0, 5)
  }