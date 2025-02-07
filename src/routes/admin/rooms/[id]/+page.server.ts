// src/routes/rooms/v2/[id]/+page.server.ts
import { fail, json, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { cinemaHall, seatCategory, seat, type Seat, cinema } from '$lib/server/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { LogLevel, logToDB } from '$lib/utils/dbLogger';

interface Block {
	id: number;
	left: number;
	top: number;
	rotation: number;
	categoryId: number;
	row?: string;
	number?: number;
}

export const load: PageServerLoad = async ({ params }) => {
	try {
		const idParam = params.id;
		const isCreate = idParam === 'create';
		let room = null;
		let seats: Seat = [];

		if (!isCreate) {
			const roomId = parseInt(idParam);
			if (isNaN(roomId)) {
				return fail(400, { error: 'Invalid room ID.' });
			}

			room = (await db.select().from(cinemaHall).where(eq(cinemaHall.id, roomId)))[0];

			if (!room) {
				return fail(404, { error: 'Room not found.' });
			}

			// Fetch seats for the room
			seats = await db.select().from(seat).where(eq(seat.cinemaHall, room!.id));

			// Optionally, verify if the room belongs to the current user's cinema
			// Example:
			// if (room.cinemaId !== currentUserCinemaId) {
			//     return fail(403, { error: 'Unauthorized access to this room.' });
			// }
		}

		const cinemas = await db.select().from(cinema);
		// Fetch seat categories
		const categories = await db.select().from(seatCategory).where(eq(seatCategory.isActive, true));

		return {
			room,
			categories,
			isCreate,
			cinemas,
			seats
			// You can include additional data as needed
		};
	} catch (error) {
		console.error('Error in load function:', error);
		return fail(500, { error: 'Failed to load data.' });
	}
};

export const actions: Actions = {
	save: async (event) => {
		const request = event.request;
		let shouldRedirect = false;

		let room = null;

		const formData = await request.formData();
		const isCreate = formData.get('isCreate') === 'true';
		const name = formData.get('name') as string;
		const layout = formData.get('layout') as string;
		const cinemaId = parseInt(formData.get('cinemaId') as string);

		if (!name || !layout || isNaN(cinemaId)) {
			return fail(400, {
				success: false,
				message: 'Name, layout, and cinema ID are required'
			});
		}

		try {
			const layoutData: Block[] = JSON.parse(layout);
			// Calculate capacity from layout (number of seats)
			const capacity = layoutData.length;

			if (isCreate) {
				// Create new room
				const newRoom = await db
					.insert(cinemaHall)
					.values({
						name,
						layout: layout, // Storing layout as JSON string
						capacity,
						cinemaId,
						isActive: true
					})
					.returning();

				room = newRoom[0];
			} else {
				// Update existing room
				const id = parseInt(formData.get('id') as string);
				if (isNaN(id)) {
					return fail(400, { success: false, message: 'Invalid room ID.' });
				}

				const updatedRoom = await db
					.update(cinemaHall)
					.set({
						name,
						layout: layout, // Update layout
						capacity
					})
					.where(eq(cinemaHall.id, id))
					.returning();

				room = updatedRoom[0];
			}

			if (!room) {
				return fail(500, { success: false, message: 'Failed to create or update room.' });
			}

			// **Handle Seats within a Transaction for Data Integrity**
			await db.transaction(async (tx) => {
				if (!isCreate) {
					// Delete existing seats
					await tx.delete(seat).where(eq(seat.cinemaHall, room.id));
				}

				// Prepare seats to insert
				const seatsToInsert: Omit<Seat, 'id'>[] = [];

				// Group blocks by row
				const rowsMap: Map<string, Block[]> = new Map();

				layoutData.forEach((block) => {
					if (!block.row || !block.number) {
						throw new Error(`Block ID ${block.id} is missing row or number.`);
					}

					if (!rowsMap.has(block.row)) {
						rowsMap.set(block.row, []);
					}

					rowsMap.get(block.row)!.push(block);
				});

				// Iterate over each row to assign seat numbers based on x-coordinate
				rowsMap.forEach((blocksInRow, rowLetter) => {
					// Sort blocks by x-coordinate (left to right)
					blocksInRow.sort((a, b) => a.left - b.left);

					blocksInRow.forEach((block, index) => {
						// Assign seat number based on sorted order
						const seatNumber = index + 1;

						seatsToInsert.push({
							cinemaHall: room.id,
							row: rowLetter,
							rotation: block.rotation,
							seatNumber: seatNumber,
							left: block.left,
							top: block.top,
							categoryId: block.categoryId,
							isActive: true
						});
					});
				});

				// Bulk insert seats
				await tx.insert(seat).values(seatsToInsert);
			});
			await logToDB(
				LogLevel.INFO,
				"Created room with id " + room.id,	
				event
			);

			if (isCreate) {
				shouldRedirect = true;
			} else {
				return {
					success: true,
					data: room
				};
			}
		} catch (error) {
			console.error('Error saving room:', error);
			return fail(500, {
				success: false,
				message: 'Failed to save room'
			});
		}
		if (shouldRedirect) {
			throw redirect(303, `/admin/rooms/${room.id}`);
		}
	}
} satisfies Actions;
