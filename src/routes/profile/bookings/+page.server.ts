import { db } from '$lib/server/db';
import {
	ticket,
	seat,
	cinemaHall,
	cinema,
	showing,
	film,
	booking,
	seatCategory,
	ticketType
} from '$lib/server/db/schema';
import { and, eq, desc, or } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	// Check if user is logged in
	if (!event.locals.user) {
		throw error(401, 'Unauthorized');
	}

	const user = event.locals.user;

	try {
		// Fetch user's bookings
		const bookings = await db
			.select()
			.from(booking)
			.where(and(eq(booking.userId, user.id), or(eq(booking.status, 'completed'))))
			.orderBy(desc(booking.date));
		return {
			bookings
		};
	} catch (error) {
		console.error('Error fetching bookings:', error);
		return fail(500, { error: 'Internal Server Error' });
	}
};
