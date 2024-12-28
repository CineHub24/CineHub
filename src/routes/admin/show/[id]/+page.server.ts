import { db } from '$lib/server/db';
import { booking, cinemaHall, film, priceSet, showing, ticket, user } from '$lib/server/db/schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { eq, and, ne, or } from 'drizzle-orm';
import { conflictingShowings } from '$lib/utils/timeSlots.js';
import { languageAwareRedirect } from '$lib/utils/languageAware.js';
function getID(url: URL) {
	const id = parseInt(url.pathname.split('/').pop() ?? '0', 10);
	return id as number;
}
const dbFail = fail(500, { message: 'Internal Server Error', database: true });

export const load = async ({ url }) => {
	const show = await db
		.select({
			id: showing.id,
			date: showing.date,
			time: showing.time,
			endTime: showing.endTime,
			filmid: film.id,
			film_name: film.title,
			film_backdrop: film.backdrop,
			priceSet: showing.priceSetId,
			cancelled: showing.cancelled,
			hallId: showing.hallid
		})
		.from(showing)
		.leftJoin(film, eq(showing.filmid, film.id))
		.innerJoin(cinemaHall, eq(showing.hallid, cinemaHall.id))
		.where(eq(showing.id, getID(url)));

	const priceSets = await db.select().from(priceSet);
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
		if (!date || !timeString || !priceSetId) {
			return fail(400, { message: 'Missing inputs', missing: true });
		}

		try {
			await db
				.update(showing)
				.set({ date: date, time: timeString, priceSetId: priceSetId, cancelled: false })
				.where(eq(showing.id, getID(url)));
		} catch (e) {
			console.log('Fehler' + e);
			return dbFail;
		}
	},
	delete: async ({ url, request }) => {
		const filmId = (await request.formData()).get('filmId') as unknown as number;

		console.log(filmId);

		try {
			await db.delete(showing).where(eq(showing.id, getID(url)));
		} catch (e) {
			console.log('error' + e);
			return dbFail;
		}
		return languageAwareRedirect(302, `/admin/film/${filmId}`);
	},
	cancel: async ({ request, url }) => {
		const formData = await request.formData();

		const showId = formData.get('showId') as unknown as number;
		if (!showId) {
		}

		try {
			await db.update(showing).set({ cancelled: true }).where(eq(showing.id, showId));

			const usersToNofity = await db
				.selectDistinct({ userEmail: user.email })
				.from(ticket)
				.innerJoin(booking, eq(ticket.bookingId, booking.id))
				.innerJoin(user, eq(booking.userId, user.id))
				.where(eq(ticket.showingId, showId));

			for (const user of usersToNofity) {
				//TODO: Send Email to user
				//TODO: Grant refund
				console.log(`Send Email to ${user.userEmail}`);
			}
		} catch (e) {
			console.log('error' + e);
			return dbFail;
		}
	},
	uncancel: async ({ request, url }) => {
		const formData = await request.formData();
		const showId = formData.get('showId') as unknown as number;
		const hallId = formData.get('hallId') as unknown as number;
		const date = formData.get('date') as string;
		const time = formData.get('time') as string;
		const endTime = formData.get('endTime') as string;

		console.log(showId, hallId, date, time, endTime);
		if (!showId || !hallId || !date || !time || !endTime) {
			return fail(400, { message: 'Missing inputs', missing: true });
		}

		try {
			const conflicts = await conflictingShowings(hallId, date, time, endTime);
			if (conflicts.length === 0) {
				await db.update(showing).set({ cancelled: false }).where(eq(showing.id, showId));
			} else {
				return fail(400, {
					message: 'Zeitraum ist nicht verfügbar',
					timeSlotConflict: true,
					timeSlot: {
						date: conflicts[0].date,
						startTime: conflicts[0].time,
						endTime: conflicts[0].endTime
					}
				});
			}
		} catch (e) {
			console.error('Fehler beim Wiederherstellen der Vorstellung:', e);
			return dbFail;
		}
	},
	reschedule: async ({ url }) => {
		//reschedule show
	}
} satisfies Actions;
