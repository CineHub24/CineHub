// src/routes/rooms/+page.server.ts

import { db } from "$lib/server/db";
import { eq } from 'drizzle-orm';
import { cinemaHall } from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { logToDB } from "$lib/utils/dbLogger";

export const actions = {
    deleteCinemaHall: async (event) => {
        try {
            const formData = await event.request.formData();
            const hallId = formData.get('hallId');

            if (!hallId) {
                return fail(400, { error: 'No hall ID provided.' });
            }

            const deletedHalls = await db.delete(cinemaHall)
                .where(eq(cinemaHall.id, Number(hallId)))
                .returning({ id: cinemaHall.id });

            if (deletedHalls.length === 0) {
                return fail(404, { error: 'Cinema hall not found.' });
            }

            const deletedId = deletedHalls[0].id;
            const userEmail = event.locals.user?.email || 'unknown user';
            const userId = event.locals.user?.id || 'unknown ID';

            await logToDB('info', `Cinema hall deleted with id: ${deletedId} by user: ${userEmail} (${userId})`);

            return {
                success: true,
                message: 'Cinema hall deleted successfully!',
                deletedId,
            };
        } catch (error) {
            console.error("Error deleting cinema hall:", error);
            return fail(500, { error: 'Failed to delete cinema hall. Please try again later.' });
        }
    },
} satisfies Actions;

// Load function to return cinema halls data
export const load: PageServerLoad = async () => {
    const cinemaHalls = await db.select().from(cinemaHall);

    return { cinemaHalls };
};
