// src/routes/rooms/v2/[id]/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { cinemaHall, seatCategory } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = async ({ params }) => {
    try {
        const idParam = params.id;
        const isCreate = idParam === 'create';
        let room = null;

        if (!isCreate) {
            const roomId = parseInt(idParam);
            if (isNaN(roomId)) {
                return fail(400, { error: 'Invalid room ID.' });
            }

            room = await db.select().from(cinemaHall)
                .where(eq(cinemaHall.id, roomId))
                .get();

            if (!room) {
                return fail(404, { error: 'Room not found.' });
            }

            // Optionally, verify if the room belongs to the current user's cinema
            // Example:
            // if (room.cinemaId !== currentUserCinemaId) {
            //     return fail(403, { error: 'Unauthorized access to this room.' });
            // }
        }

        // Fetch seat categories
        const categories = await db.select().from(seatCategory)
            .where(eq(seatCategory.isActive, true));

        return {
            room,
            categories,
            isCreate,
            // You can include additional data as needed
        };
    } catch (error) {
        console.error("Error in load function:", error);
        return fail(500, { error: 'Failed to load data.' });
    }
};

export const actions: Actions = {
    save: async ({ request }) => {
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
            const layoutData = JSON.parse(layout);
            // Calculate capacity from layout
            const capacity = layoutData.length;

            if (isCreate) {
                // Create new room
                const newRoom = await db.insert(cinemaHall)
                    .values({
                        name,
                        layout: layoutData,
                        capacity,
                        cinemaId,
                        isActive: true
                    })
                    .returning();

                return {
                    success: true,
                    data: newRoom[0]
                };
            } else {
                // Update existing room
                const id = parseInt(formData.get('id') as string);
                if (isNaN(id)) {
                    return fail(400, { success: false, message: 'Invalid room ID.' });
                }

                const updatedRoom = await db.update(cinemaHall)
                    .set({
                        name,
                        layout: layoutData,
                        capacity
                    })
                    .where(eq(cinemaHall.id, id))
                    .returning();

                return {
                    success: true,
                    data: updatedRoom[0]
                };
            }
        } catch (error) {
            console.error('Error saving room:', error);
            return fail(500, {
                success: false,
                message: 'Failed to save room'
            });
        }
    }
} satisfies Actions;
