import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, gte, lte } from 'drizzle-orm';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import {
	cinema,
	cinemaHall,
	film,
	priceSet,
	showing,
	type Cinema,
	type CinemaHall,
	type Film
} from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { languageAwareRedirect } from '$lib/utils/languageAware.js';

interface TimeWindow {
	start: string | null;
	end: string | null;
	duration: number;
	possibletimes?: string[];
}

export const load = async (event) => {
	const selectedFilm: Film[] = await db
		.select()
		.from(film)
		.where(eq(film.id, event.params.id as unknown as number));
	const cinemas: Cinema[] = await db.select().from(cinema);

	const selectedHalls: CinemaHall[] = await db.select().from(cinemaHall);
	console.log('server' + selectedHalls.toString());
	const priceSets = await db.select().from(priceSet);
	return {
		selectedFilm: selectedFilm[0],
		cinemas: cinemas,
		halls: selectedHalls,
		priceSets: priceSets
	};
};

export const actions = {
	getTimeWindows: async ({ request, locals }) => {
		const data = await request.formData();
		const hallId = Number(data.get('hallId'));
		const filmDate = new Date(data.get('date') as string);
		const filmDuration = Number(data.get('duration'));
		const cinemaId = Number(data.get('cinemaId'));
		console.log(cinemaId);
		if (!hallId || !filmDate || !filmDuration) {
			return fail(400, { error: 'Alle Felder werden benötigt' });
		}

		try {
			const timeWindows = await getAvailableTimeWindows(
				db,
				cinemaId,
				hallId,
				filmDate,
				filmDuration
			);

			return { success: true, timeWindows };
		} catch (error) {
			console.log(error);
			return fail(500, { error: 'Server-Fehler beim Abrufen der Zeitfenster' });
		}
	},

	getTimes: async ({ request }) => {
		const data = await request.formData();
		const windowStart = data.get('windowStart') as string;
		const windowEnd = data.get('windowEnd') as string;
		const totalDuration = Number(data.get('totalDuration'));

		if (!windowStart || !windowEnd || !totalDuration) {
			return fail(400, { error: 'Alle Felder werden benötigt' });
		}

		const timeWindow = {
			start: windowStart,
			end: windowEnd,
			duration: calculateTimeDifference(windowStart, windowEnd)
		};

		const times = getPossibletimes(timeWindow, totalDuration, 5);
		return { success: true, times };
	},
	saveShowing: async ({ request }) => {
		const data = await request.formData();
		const filmId = Number(data.get('filmId'));
		const hallId = Number(data.get('hallId'));
		const startTime = data.get('startTime') as string;
		let endTime = data.get('endTime') as string;
		const priceSetId = Number(data.get('priceSet'));
		const date = data.get('date') as string;

		console.log(
			'film' +
				filmId +
				'hall' +
				hallId +
				'start' +
				startTime +
				'end' +
				endTime +
				'price' +
				priceSetId +
				'data' +
				date
		);
		if (endTime === '00:00') {
			endTime = '24:00';
		}

		try {
			await db
				.insert(showing)
				.values({
					filmid: filmId,
					hallid: hallId,
					time: startTime,
					endTime: endTime,
					priceSetId: priceSetId,
					date: date
				});
		} catch (error) {
			console.log(error);
			return fail(500, { error: 'Server-Fehler beim Speichern der Vorstellung' });
		}
		return languageAwareRedirect(302, `/admin/film/${filmId}`);
	}
} satisfies Actions;

async function getAvailableTimeWindows(
	db: PostgresJsDatabase,
	cinemaId: number,
	hallId: number,
	filmDate: Date,
	filmDuration: number,
	cleaningTime: number = 15,
	advertisementTime: number = 15
): Promise<TimeWindow[]> {
	const totalDuration = filmDuration + cleaningTime + advertisementTime;
	const dateStr = filmDate.toISOString().split('T')[0];
	console.log(dateStr);
	console.log(cinemaId);
	const cinemaTimes = await db.select().from(cinema).where(eq(cinema.id, cinemaId));
	console.log(cinemaTimes);
	const startTimeStr = `${dateStr} ${cinemaTimes[0].opentime}`;
	const endTimeStr = `${dateStr} ${cinemaTimes[0].closeTime}`;

	const timeWindows: TimeWindow[] = [];
	let windowStart = cinemaTimes[0].opentime;

	const existingShowings = await db
		.select()
		.from(showing)
		.where(
			and(
				eq(showing.hallid, hallId),
				eq(showing.date, dateStr),
				gte(showing.time, startTimeStr),
				lte(showing.time, endTimeStr)
			)
		)
		.orderBy(showing.time);

	for (const show of existingShowings) {
		const showStart = show.time;
		const timeDiff = showStart ? calculateTimeDifference(windowStart as string, showStart) : 0;

		if (timeDiff >= totalDuration) {
			timeWindows.push({
				start: windowStart,
				end: showStart,
				duration: timeDiff
			});
		}
		windowStart = show.endTime ?? show.time ?? '';
	}

	const finalDiff = calculateTimeDifference(windowStart ?? '', cinemaTimes[0].closeTime ?? '');
	if (finalDiff >= totalDuration) {
		timeWindows.push({
			start: windowStart,
			end: cinemaTimes[0].closeTime,
			duration: finalDiff
		});
	}

	return timeWindows;
}

function getPossibletimes(
	timeWindow: TimeWindow,
	totalDuration: number,
	intervalMinutes: number = 5
): string[] {
	const times: string[] = [];
	let currentTime = new Date(`1970-01-01T${timeWindow.start}`);
	const endTime = new Date(`1970-01-01T${timeWindow.end}`);

	while (true) {
		const potentialEndTime = new Date(currentTime.getTime() + totalDuration * 60000);
		if (potentialEndTime > endTime) break;

		times.push(currentTime.toTimeString().slice(0, 5));
		currentTime = new Date(currentTime.getTime() + intervalMinutes * 60000);
	}

	return times;
}

function calculateTimeDifference(start: string, end: string): number {
	let time = new Date(`1970-01-01T${start}`);
	let endTime = new Date(`1970-01-01T${end}`);

	// Wenn die Endzeit 00:00 ist, setzen wir sie auf 24:00 des gleichen Tages
	if (end === '00:00') {
		endTime = new Date(`1970-01-01T24:00`);
	}

	return Math.floor((endTime.getTime() - time.getTime()) / (1000 * 60));
}
