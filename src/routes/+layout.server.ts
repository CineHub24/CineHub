import { db } from '$lib/server/db';
import { cinema } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const cinemas = await db.select().from(cinema).orderBy(cinema.name);

	const preferredCinemaId = event.cookies.get('preferredCinema');

	// Find preferred cinema object (if it exists)
	let preferredCinema = null;
	if (preferredCinemaId) {
		preferredCinema = cinemas.find(
			(cinema) => cinema.id.toString() === preferredCinemaId.toString()
		);
	} else {
		preferredCinema = cinemas[0];
	}

	// Move preferred cinema to the 0th index (if found and valid)
	if (preferredCinema) {
		const preferredCinemaIndex = cinemas.indexOf(preferredCinema);
		if (preferredCinemaIndex > -1) {
			// Ensure valid index
			cinemas.splice(preferredCinemaIndex, 1); // Remove from current position
			cinemas.unshift(preferredCinema); // Add to the beginning
		}
	}

	return { user: event.locals.user, cinemas };
};
