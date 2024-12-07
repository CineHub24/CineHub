import { db } from '$lib/server/db';
import { film, showing } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, sql, and } from 'drizzle-orm';
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
	.from(showing).where(eq(showing.filmid, <number>id))

	return {
		film: movies[0],
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
       	const runtimeString = formData.get('runtime') as string;
		
		let runtime: number | null = null;
		if (/^\d+$/.test(runtimeString)) {
			runtime = Number(runtimeString);
		} else {
			throw error(400, 'Ungültige Eingabe');
		}
		
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
		let hall = formData.get('hall') as unknown as number;
		
		const freeSlots = await getFreeTimeSlots(
			db,               // Drizzle Datenbank-Instanz
			hall,                // Saal-ID
			date,       // Datum
			30,               // Filmdauer in Minuten
			15,                // Standard 15 Minuten Reinigung
			15                 // Standard 15 Minuten Werbung
		  )
		  for (const slot of freeSlots) {
			console.log(`Freier Slot: ${slot.start} - ${slot.end}`)
		  }
		


// 		try{
// 			// await db.insert(showing).values({date: date, time:timeString, filmid:id as number})
// 			await db.insert(showing).values({hallid: hall ,date: date, time: timeString,filmid: id as number, endTime: sql`(${timeString}::time + (SELECT (runtime || ' minutes')::interval FROM ${film} WHERE id =${id as number} ))`
//   })
// 		} catch(e){
// 			console.log(e)
// 		}


	}
} satisfies Actions;const getFreeTimeSlots = async (
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
		  end: endTime
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