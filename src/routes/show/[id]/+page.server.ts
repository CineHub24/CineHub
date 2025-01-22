import { db } from '$lib/server/db';
import {
	seat,
	cinemaHall,
	seatCategory,
	showing,
	ticket,
	booking,
	ticketType,
	priceSet
} from '$lib/server/db/schema';
import { eq, inArray, sql, and, ne } from 'drizzle-orm';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../../$types';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { notifySeatChange } from '$lib/server/sse';

type SeatType = typeof seat.$inferSelect;

type Seat = SeatType & { booked?: boolean };

type SeatCategory = typeof seatCategory.$inferSelect;
interface SeatResponse {
	seat: Seat;
	seatCategory: SeatCategory;
}

type Showing = typeof showing.$inferSelect;

type CinemaHall = typeof cinemaHall.$inferSelect;

type Ticket = typeof ticket.$inferInsert;

export const actions = {
	reserveSeat: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Must be logged in to reserve seats' });
		}

		const formData = await request.formData();
		const showingId = Number(formData.get('showingId'));
		const seatId = Number(formData.get('seatId'));
		const ticketTypeId = formData.get('ticketType') ? Number(formData.get('ticketType')) : null;

		try {
			const existingTicket = await db
				.select()
				.from(ticket)
				.leftJoin(booking, eq(ticket.bookingId, booking.id))
				.where(
					and(
						eq(ticket.showingId, showingId),
						eq(ticket.seatId, seatId),
						inArray(ticket.status, ['reserved', 'paid']),
						sql`${booking.userId} <> ${locals.user.id}`
					)
				)
				.limit(1);

			if (existingTicket.length > 0) {
				return fail(400, {
					error: 'Seat is no longer available'
				});
			}

			// 1. Get seat and its category.
			const [currentSeat] = await db.select().from(seat).where(eq(seat.id, seatId));

			if (!currentSeat) {
				return fail(400, { error: 'Seat not found' });
			}

			const [category] = await db
				.select()
				.from(seatCategory)
				.where(eq(seatCategory.id, currentSeat.categoryId));

			if (!category) {
				return fail(400, { error: 'Seat category not found' });
			}

			// 2. Get the showing and its price set.
			const [currentShowing] = await db.select().from(showing).where(eq(showing.id, showingId));
			if (!currentShowing) {
				return fail(400, { error: 'Showing not found' });
			}

			const [currentPriceSet] = await db
				.select()
				.from(priceSet)
				.where(eq(priceSet.id, currentShowing.priceSetId));

			if (!currentPriceSet) {
				return fail(400, { error: 'Price set not found' });
			}

			// 3. Calculate final price.
			let finalPrice = null;
			if (ticketTypeId) {
				const [selectedTicketType] = await db
					.select()
					.from(ticketType)
					.where(eq(ticketType.id, ticketTypeId));
				if (!selectedTicketType) {
					return fail(400, { error: 'Ticket type not found' });
				}

				const basePrice = Number(category.price);
				const typeMultiplier = Number(selectedTicketType.factor);
				const priceSetMultiplier = Number(currentPriceSet.priceFactor);
				finalPrice = (basePrice * typeMultiplier * priceSetMultiplier).toFixed(2);
			} else {
				const basePrice = Number(category.price);
				const priceSetMultiplier = Number(currentPriceSet.priceFactor);
				finalPrice = (basePrice * priceSetMultiplier).toFixed(2);
			}

			// 4. Get or create an active booking for the user.
			let bookings = await db
				.select()
				.from(booking)
				.where(and(eq(booking.userId, locals.user.id), ne(booking.status, 'completed')));

			if (bookings.length === 0) {
				bookings = await db
					.insert(booking)
					.values({
						userId: locals.user.id
					})
					.returning();
			}
			const userBooking = bookings[0];

			// Check if there's already a reservation for this user on the same seat and showing.
			const [userTicket] = await db
				.select()
				.from(ticket)
				.where(
					and(
						eq(ticket.showingId, showingId),
						eq(ticket.seatId, seatId),
						eq(ticket.bookingId, userBooking.id)
					)
				)
				.limit(1);

			if (userTicket) {
				// Allow update if the ticket belongs to the current user.
				await db
					.update(ticket)
					.set({
						status: 'reserved',
						type: ticketTypeId,
						price: finalPrice,
						expiresAt: new Date(Date.now() + 15 * 60 * 1000)
					})
					.where(eq(ticket.id, userTicket.id));
			} else {
				// Otherwise, insert a new reservation.
				await db.insert(ticket).values({
					status: 'reserved',
					showingId,
					bookingId: userBooking.id,
					seatId,
					type: ticketTypeId,
					price: finalPrice,
					expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
				});
			}

			if (showingId) {
				await notifySeatChange(showingId.toString());
			}
			return { success: true };
		} catch (error) {
			console.error('Error reserving seat:', error);
			return fail(500, {
				error: 'Failed to reserve seat. Please try again.'
			});
		}
	},

	cancelSeat: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Must be logged in to cancel reservation' });
		}

		const formData = await request.formData();
		const showingId = Number(formData.get('showingId'));
		const seatId = Number(formData.get('seatId'));

		try {
			// Check if seat is reserved by user
			const existingTicket = await db
				.select()
				.from(ticket)
				.where(
					and(
						eq(ticket.showingId, showingId),
						eq(ticket.seatId, seatId),
						eq(ticket.status, 'reserved')
					)
				)
				.limit(1);

			if (existingTicket.length === 0) {
				return fail(400, {
					error: 'Seat is not reserved by you'
				});
			}

			await db.delete(ticket).where(eq(ticket.id, existingTicket[0].id));

			if (showingId) {
				await notifySeatChange(showingId.toString());
			}

			return { success: true };
		} catch (error) {
			console.error('Error canceling reservation:', error);
			return fail(500, {
				error: 'Failed to cancel reservation. Please try again.'
			});
		}
	},

	bookSeats: async ({ request, locals }) => {
		let shouldRedirect = false;

		const formData = await request.formData();
		const showingId = Number(formData.get('showingId'));
		const seatIds = formData.getAll('seatIds').map((id) => Number(id));
		const ticketTypes = formData.getAll('ticketTypes').map((id) => Number(id));

		try {
			// 1. Load all required data for price calculation
			const seats = await db.select().from(seat).where(inArray(seat.id, seatIds));

			const seatCategories = await db
				.select()
				.from(seatCategory)
				.where(
					inArray(
						seatCategory.id,
						seats.map((s) => s.categoryId)
					)
				);

			const selectedTicketTypes = await db
				.select()
				.from(ticketType)
				.where(inArray(ticketType.id, ticketTypes));

			const _showings = await db.select().from(showing).where(eq(showing.id, showingId));

			const _showing = _showings[0];

			const _priceSets = await db
				.select()
				.from(priceSet)
				.where(eq(priceSet.id, _showing.priceSetId));

			const _priceSet = _priceSets[0];

			// 2. Get existing booking for user
			const bookings = await db
				.select()
				.from(booking)
				.where(and(eq(booking.userId, locals.user!.id), ne(booking.status, 'completed')));

			if (bookings.length === 0) {
				return fail(400, {
					error: 'No active booking found'
				});
			}

			const userBooking = bookings[0];

			// 3. Update each ticket individually with its calculated price
			for (let i = 0; i < seatIds.length; i++) {
				const seatId = seatIds[i];
				const currentSeat = seats.find((s) => s.id === seatId)!;
				const category = seatCategories.find((c) => c.id === currentSeat.categoryId)!;
				const ticketType = selectedTicketTypes.find((t) => t.id === ticketTypes[i])!;

				// Calculate individual ticket price
				const basePrice = Number(category.price);
				const typeMultiplier = Number(ticketType.factor);
				const priceSetMultiplier = Number(_priceSet.priceFactor);
				const finalPrice = (basePrice * typeMultiplier * priceSetMultiplier).toFixed(2);

				// Update the specific ticket
				await db
					.update(ticket)
					.set({
						type: ticketTypes[i],
						price: finalPrice
					})
					.where(
						and(
							eq(ticket.seatId, seatId),
							eq(ticket.showingId, showingId),
							eq(ticket.bookingId, userBooking.id),
							eq(ticket.status, 'reserved')
						)
					);
			}

			notifySeatChange(showingId.toString());
			shouldRedirect = true;
		} catch (error) {
			console.error('Error updating tickets:', error);
			return fail(500, {
				error: 'Failed to update tickets. Please try again.'
			});
		}

		if (shouldRedirect) {
			throw languageAwareRedirect(303, '/cart');
		}
	}
} satisfies Actions;

export const load: PageServerLoad = async ({ params, locals }) => {
	const showingId = Number(params.id);

	// 1) Load showing
	const _showing = await db
		.select()
		.from(showing)
		.where(eq(showing.id, showingId))
		.then((rows) => rows[0]);
	if (!_showing) {
		return fail(404, { error: true, message: 'Showing not found' });
	}

	// 2) Load hall
	const hall = await db
		.select()
		.from(cinemaHall)
		.where(eq(cinemaHall.id, _showing.hallid!))
		.then((rows) => rows[0]);

	// 3) Load seat + seatCategory
	const seatsWithCategory = await db
		.select({
			seat: seat,
			category: seatCategory
		})
		.from(seat)
		.leftJoin(seatCategory, eq(seat.categoryId, seatCategory.id))
		.where(eq(seat.cinemaHall, _showing.hallid!));

	// 4) Query tickets for this showing (with userId)
	const ticketsWithUsers = await db
		.select({
			seatId: ticket.seatId,
			status: ticket.status,
			userId: booking.userId
		})
		.from(ticket)
		.leftJoin(booking, eq(ticket.bookingId, booking.id))
		.where(eq(ticket.showingId, showingId));

	// 5) Build seat array with consistent status + userId
	const seats = seatsWithCategory.map(({ seat: seatData, category }) => {
		let seatStatus: 'available' | 'reserved' | 'paid' = 'available';
		let seatUserId: string | null = null;

		const match = ticketsWithUsers.find((t) => t.seatId === seatData.id);
		if (match) {
			if (match.status === 'paid') {
				seatStatus = 'paid';
				seatUserId = match.userId;
			} else if (match.status === 'reserved') {
				seatStatus = 'reserved';
				seatUserId = match.userId;
			}
		}

		return {
			...seatData,
			status: seatStatus,
			userId: seatUserId,
			category
		};
	});

	// 6) If needed, get userReservedSeats to highlight user seats initially
	let userReservedSeats = [];
	if (locals.user) {
		const userBooking = await db
			.select()
			.from(booking)
			.where(and(eq(booking.userId, locals.user.id), ne(booking.status, 'completed')))
			.limit(1);

		if (userBooking.length > 0) {
			userReservedSeats = await db
				.select()
				.from(ticket)
				.where(and(eq(ticket.bookingId, userBooking[0].id), eq(ticket.status, 'reserved')));
		}
	}

	// 7) Load ticket types
	const ticketTypesList = await db.select().from(ticketType);

	// 8) Load price set for this showing
	const _priceSet = await db
		.select()
		.from(priceSet)
		.where(eq(priceSet.id, _showing.priceSetId))
		.then((rows) => rows[0]);

	return {
		showing: _showing,
		hall,
		seats,
		seatCategories: [...new Map(seats.map((s) => [s.category.id, s.category])).values()],
		ticketTypes: ticketTypesList,
		userReservedSeats,
		priceSet: _priceSet
	};
};
