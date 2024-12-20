import { goto } from '$app/navigation';
import { db } from '$lib/server/db';
import { booking, cinemaHall, film, priceSet, showing, ticket, user } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { get } from 'svelte/store';

function getID(url: URL) { 
	const id = parseInt(url.pathname.split('/').pop() ?? '0', 10);
	return id as number;
}

export const load = async ({ url }) => {

	const show = await db
		.select({ id: showing.id, date: showing.date, time: showing.time, endTime: showing.endTime, hall: cinemaHall.hallNumber, filmid: film.id, film_name: film.title, film_backdrop: film.backdrop, priceSet: showing.priceSetId })
		.from(showing)
		.leftJoin(film, eq(showing.filmid, film.id))
		.innerJoin(cinemaHall, eq(showing.hallid, cinemaHall.id))
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

		console.log(priceSetId);

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
	},
	cancel: async ({request, url}) =>{
		const formData = await request.formData();

		const showId = formData.get('showId') as unknown as number;

		try{
			await db.update(showing).set({cancelled: true}).where(eq(showing.id, showId));


			const usersToNofity = await db
				.selectDistinct({userEmail: user.email})
				.from(ticket)
				.innerJoin(booking, eq(ticket.bookingId, booking.id))
				.innerJoin(user, eq(booking.userId, user.id))
				.where(eq(ticket.showingId, showId));

			for (const user of usersToNofity){
				//TODO: Send Email to user
				//TODO: Grant refund
				console.log(`Send Email to ${user.userEmail}`);
			}

			
		}
		catch(e){
			console.log("error" + e)
		}
	},
	reschedule: async ({url}) =>{
		//reschedule show
	}
} satisfies Actions;
