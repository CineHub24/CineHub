import { db } from "$lib/server/db";
import { eq } from 'drizzle-orm';
import { cinemaHall } from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "../../$types";
import { redirect } from "@sveltejs/kit";

export const actions = {
    deleteCinemaHall: async ({ request }) => {
        try {
            const formData = await request.formData();
            const hallId = formData.get('hallId');

            if (!hallId) throw new Error('No hall id provided');

            const id = await db.delete(cinemaHall).where(eq(cinemaHall.id, Number(hallId))).returning({ id: cinemaHall.id });
            console.log("id" + id)


            return {
                status: 200,
                body: { success: true, message: 'Cinema hall deleted successfully!' },
            };
        } catch (error) {
            console.log("error" + error)
            return {
                status: 500,
                body: { error: error },
            };
        }

    },
} satisfies Actions;

// Load function to return cinema halls data
export const load: PageServerLoad = async () => {
    const cinemaHalls = await db.select().from(cinemaHall);


    return { cinemaHalls };
};