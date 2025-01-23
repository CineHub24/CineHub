import { db } from '$lib/server/db';
import * as m from '$lib/paraglide/messages.js';
import {
	booking,
	cinemaHall,
	film,
	priceSet,
	showing,
	ticket,
	user,
	type Showing
} from '$lib/server/db/schema';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { eq, and, ne, or } from 'drizzle-orm';
import { conflictingShowings } from '$lib/utils/timeSlots.js';
import { languageAwareRedirect } from '$lib/utils/languageAware.js';

import { EmailService } from '$lib/utils/emailService';
import { LogLevel, logToDB } from '$lib/utils/dbLogger';

function getID(url: URL) {
	const id = parseInt(url.pathname.split('/').pop() ?? '0', 10);
	return id as number;
}
async function notifyUsers(showId: number) {
	const gmailUser = import.meta.env.VITE_GMAIL_USER;
	const gmailAppPassword = import.meta.env.VITE_GMAIL_APP_PASSWORD;
	const emailClient = new EmailService(gmailUser, gmailAppPassword);

	try {
		const usersToNofity = await db
			.selectDistinct({ userEmail: user.email })
			.from(ticket)
			.innerJoin(booking, eq(ticket.bookingId, booking.id))
			.innerJoin(user, eq(booking.userId, user.id))
			.where(eq(ticket.showingId, showId));

		for (const user of usersToNofity) {
			try {
				console.log(`Sending Email to ${user.userEmail}`);
				await emailClient.sendCancelationConfirmation(showId, user.userEmail as string);
				console.log('Email sent');
				return { success: true };
			} catch (error) {
				console.error('Fehler beim Versenden der E-Mail:', error);
				return fail(500, { message: m.internal_server_error({}), email: true });
			}
		}
	} catch (error) {
		console.error('Fehler beim Abrufen der Nutzerdaten:', error);
		return fail(500, { message: m.internal_server_error({}), database: true });
	}
}

const dbFail = fail(500, { message: m.internal_server_error({}), database: true });
const missingInputs = fail(400, { message: m.missing_inputs({}), missing: true });

export const load = async ({ url }) => {
	try {
		const show = await db
			.select({
				id: showing.id,
				date: showing.date,
				time: showing.time,
				endTime: showing.endTime,
				runtime: film.runtime,
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
	} catch (error) {
		console.error('Fehler beim Laden der Vorstellung:', error);
		return dbFail;
	}
};

export const actions = {
	update: async ({ request, url }) => {
		// Formular-Daten auslesen
		const formData = await request.formData();
		// Einzelne Werte extrahieren

		let date = formData.get('date') as string;
		let timeString = formData.get('time') as string;
		let priceSetId = formData.get('priceSet') as unknown as number;

		if (!date || !timeString || !priceSetId) {
			return missingInputs;
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
	delete: async (event) => {
		const url = event.url;
		const request = event.request;
		const filmId = (await request.formData()).get('filmId') as unknown as number;

		try {
			await db.delete(showing).where(eq(showing.id, getID(url)));
			await logToDB(
				LogLevel.INFO,
				"Deleted showing with id " + getID(url),	
				event
			);
		} catch (e) {
			console.log('error' + e);
			return dbFail;
		}
		return languageAwareRedirect(302, `/admin/film/${filmId}`);
	},
	cancel: async (event) => {
		const request = event.request;
		const formData = await request.formData();

		const showId = formData.get('showId') as unknown as number;
		if (!showId) {
			return missingInputs;
		}

		try {
			await db.update(showing).set({ cancelled: true }).where(eq(showing.id, showId));
			await logToDB(
				LogLevel.INFO,
				"Cancelled showing with id " + showId,	
				event
			);
			await notifyUsers(showId);
		} catch (e) {
			console.log('error' + e);
			return dbFail;
		}
	},
	uncancel: async (event) => {
		const request = event.request;
		const formData = await request.formData();
		const showId = formData.get('showId') as unknown as number;
		const hallId = formData.get('hallId') as unknown as number;
		const date = formData.get('date') as string;
		const time = formData.get('time') as string;
		const endTime = formData.get('endTime') as string;

		if (!showId || !hallId || !date || !time || !endTime) {
			return missingInputs;
		}
		const conflicts = await conflictingShowings(hallId, date, time, endTime);

		if (conflicts.length > 0) {
			return fail(400, {
				message: m.slot_not_available({}),
				timeSlotConflict: true,
				timeSlot: {
					date: conflicts[0].date,
					startTime: conflicts[0].time,
					endTime: conflicts[0].endTime
				}
			});
		} else {
			try {
				await db.update(showing).set({ cancelled: false }).where(eq(showing.id, showId));
				await logToDB(
					LogLevel.INFO,
					"Uncancelled showing with id " + showId,	
					event
				);
			} catch (e) {
				console.error('Fehler beim Wiederherstellen der Vorstellung:', e);
				return dbFail;
			}
		}
	},
	reschedule: async ({ request, url }) => {
		const formData = await request.formData();
		const showId = formData.get('showId') as unknown as number;
		const newDate = formData.get('date') as string;
		const newStartTime = formData.get('time') as string;
		const newEndTime = formData.get('endTime') as string;
		const hallId = formData.get('hallId') as unknown as number;
		const cancelled = formData.get('cancelled') as unknown as boolean;

		if (!showId || !newDate || !newStartTime || !newEndTime || !hallId) {
			return missingInputs;
		}
		const conflicts = await conflictingShowings(hallId, newDate, newStartTime, newEndTime);
		if (conflicts.length > 0) {
			return fail(400, {
				message: m.slot_not_available({}),
				timeSlotConflict: true,
				timeSlot: {
					date: conflicts[0].date,
					startTime: conflicts[0].time,
					endTime: conflicts[0].endTime
				}
			});
		} else {
			try {
				const oldShow = await db
					.update(showing)
					.set({ cancelled: true })
					.where(eq(showing.id, showId))
					.returning({
						hallid: showing.hallid,
						date: showing.date,
						time: showing.time,
						endTime: showing.endTime,
						filmid: showing.filmid,
						priceSetId: showing.priceSetId,
						cancelled: showing.cancelled,
						language: showing.language,
						dimension: showing.dimension
					});
				await notifyUsers(showId);

				oldShow[0].date = newDate;
				oldShow[0].time = newStartTime;
				oldShow[0].endTime = newEndTime;
				oldShow[0].cancelled = false;
				const newShow = await db
					.insert(showing)
					.values(oldShow[0])
					.returning({ newId: showing.id });

				return { rescheduled: true, message: m.show_rescheduled({}), newId: newShow[0].newId };
			} catch (e) {
				console.log(e);
				return dbFail;
			}
		}
	}
} satisfies Actions;
