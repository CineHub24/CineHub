// src/routes/rooms/+page.server.ts

import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { cinema, cinemaHall } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { logToDB } from '$lib/utils/dbLogger';
import { url } from 'node:inspector';

export const actions = {
	deleteCinemaHall: async (event) => {
		try {
			const formData = await event.request.formData();
			const hallId = formData.get('hallId');

			if (!hallId) {
				return fail(400, { error: 'No hall ID provided.' });
			}

			const deletedHalls = await db
				.delete(cinemaHall)
				.where(eq(cinemaHall.id, Number(hallId)))
				.returning({ id: cinemaHall.id });

			if (deletedHalls.length === 0) {
				return fail(404, { error: 'Cinema hall not found.' });
			}

			const deletedId = deletedHalls[0].id;
			const userEmail = event.locals.user?.email || 'unknown user';
			const userId = event.locals.user?.id || 'unknown ID';

			await logToDB(
				'info',
				`Cinema hall deleted with id: ${deletedId} by user: ${userEmail} (${userId})`
			);

			return {
				success: true,
				message: 'Cinema hall deleted successfully!',
				deletedId
			};
		} catch (error) {
			console.error('Error deleting cinema hall:', error);
			return fail(500, { error: 'Failed to delete cinema hall. Please try again later.' });
		}
	}
} satisfies Actions;

// Load function to return cinema halls data
export const load: PageServerLoad = async ({ url }) => {
	// Extract cinemaId from query parameters
	const cinemaIdParam = url.searchParams.get('cinemaId');
	const cinemaId = cinemaIdParam ? Number(cinemaIdParam) : null;

	// Fetch all cinemas for the filter dropdown
	const cinemas = await db.select().from(cinema);

	// Fetch cinema halls based on cinemaId if provided
	let cinemaHallsQuery = db.select().from(cinemaHall);
	if (cinemaId) {
		cinemaHallsQuery = cinemaHallsQuery.where(eq(cinemaHall.cinemaId, cinemaId));
	}
	const cinemaHalls = await cinemaHallsQuery;

	return { cinemaHalls, cinemas, selectedCinemaId: cinemaId };
};
