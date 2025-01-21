import { db } from '$lib/server/db';
import { showing } from '$lib/server/db/schema';
import { eq, and, ne, or, gt, gte, lt, lte, between } from 'drizzle-orm';

export const getFreeTimeSlots = async (
	database: typeof db,
	hallId: number,
	priceSetId: number,
	filmDate: string,
	filmDuration: number,
	cleaningTime: number = 15,
	advertisementTime: number = 15
) => {
	const totalSlotDuration = filmDuration + cleaningTime + advertisementTime;

	const existingShowings = await db
		.select()
		.from(showing)
		.where(
			and(and(eq(showing.hallid, hallId), eq(showing.date, filmDate)), ne(showing.cancelled, true))
		)
		.orderBy(showing.time);

	const freeSlots = [];
	const cinemaOpenTime = '08:00';
	const cinemaCloseTime = '24:00';

	// Generiere mögliche Startzeitpunkte (volle und halbe Stunden)
	const generatePossibleStartTimes = () => {
		const times = [];
		const start = new Date(`1970-01-01T${cinemaOpenTime}`);
		const end = new Date(`1970-01-01T${cinemaCloseTime}`);

		while (start < end) {
			times.push(start.toTimeString().slice(0, 5));

			// Volle Stunde
			const fullHour = new Date(start);
			fullHour.setHours(fullHour.getHours() + 1, 0, 0, 0);

			// Halbe Stunde
			const halfHour = new Date(start);
			halfHour.setHours(halfHour.getHours(), 30, 0, 0);

			times.push(fullHour.toTimeString().slice(0, 5));
			times.push(halfHour.toTimeString().slice(0, 5));

			start.setHours(start.getHours() + 1);
		}

		return times.filter((time) => time >= cinemaOpenTime && time < cinemaCloseTime);
	};

	const possibleStartTimes = generatePossibleStartTimes();

	// Prüfe jeden möglichen Startzeitpunkt
	for (const startTime of possibleStartTimes) {
		const endTime = calculateEndTime(startTime, totalSlotDuration);

		// Prüfe, ob der Slot mit keiner Vorstellung kollidiert
		const isSlotFree = !existingShowings.some(
			(show) =>
				(show.time !== null &&
					startTime >= show.time &&
					show.endTime !== null &&
					startTime < show.endTime) ||
				(show.time !== null &&
					endTime > show.time &&
					show.endTime !== null &&
					endTime <= show.endTime) ||
				(show.time !== null &&
					startTime <= show.time &&
					show.endTime !== null &&
					endTime >= show.endTime)
		);

		if (isSlotFree) {
			freeSlots.push({
				start: startTime,
				end: endTime,
				date: filmDate,
				hallid: hallId,
				priceSetId: priceSetId
			});
		}
	}

	return freeSlots;
};

export function calculateTimeDifference(start: string, end: string): number {
	const startTime = new Date(`1970-01-01T${start}`);
	const endTime = new Date(`1970-01-01T${end}`);
	return (endTime.getTime() - startTime.getTime()) / (1000 * 60);
}

export function calculateEndTime(startTime: string, durationInMinutes: number): string {
	const start = new Date(`1970-01-01T${startTime}`);
	const end = new Date(start.getTime() + durationInMinutes * 60000);

	return end.toTimeString().slice(0, 5);
}
export const conflictingShowings = async (
	hallId: number,
	date: string,
	startTime: string,
	endTime: string
) => {
	const conflictingShowings = await db
		.select()
		.from(showing)
		.where(
			and(
				eq(showing.hallid, hallId),
				eq(showing.date, date),
				eq(showing.cancelled, false),
				or(
					between(showing.time, startTime, endTime),
					between(showing.endTime, startTime, endTime),
					and(gte(showing.time, startTime), lte(showing.endTime, endTime)),
					and(lte(showing.time, startTime), gte(showing.endTime, endTime))
				)
			)
		);
	return conflictingShowings;
};
