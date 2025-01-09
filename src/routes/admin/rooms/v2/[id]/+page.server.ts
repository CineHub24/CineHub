// src/routes/admin/rooms/v2/[id]/+page.server.ts

import { db } from "$lib/server/db";
import { eq } from 'drizzle-orm';
import { cinemaHall, seatCategory } from "$lib/server/db/schema"; // Ensure correct imports
import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { logToDB } from "$lib/utils/dbLogger";

export const load: PageServerLoad = async ({ params }) => {
    try {
        const roomId = Number(params.id);
        if (isNaN(roomId)) {
            return fail(400, { error: 'Invalid room ID.' });
        }

        // Fetch room details
        const room = await db.select().from(cinemaHall).where(eq(cinemaHall.id, roomId)).one();

        if (!room) {
            return fail(404, { error: 'Room not found.' });
        }

        // Fetch associated seat categories
        const categories = await db.select().from(seatCategory).where(eq(seatCategory.cinemaId, room.cinemaId));

        // Return a plain object
        return { room, categories };
    } catch (error) {
        console.error("Error in load function:", error);
        return fail(500, { error: 'Failed to load data. Please try again later.' });
    }
};

export const actions: Actions = {
    // Define your actions here (e.g., update room details)
} satisfies Actions;
