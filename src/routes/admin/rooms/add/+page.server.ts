import { db } from '$lib/server/db';
import { seat, cinemaHall, seatCategory } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

interface SeatPlan {
    seatNumber: string;
    row: string;
    type: string;
    categoryId: number;
}

export const actions = {
    saveSeats: async ({ request }) => {
        let shouldRedirect = false;

        try {
            const formData = await request.formData();
            const seatPlanData = formData.get('seatPlanData');
            const name = formData.get('name');

            if (!name) throw new Error('No hall number provided');

            if (typeof seatPlanData !== 'string') throw new Error('Invalid seat plan data');

            const seats: SeatPlan[] = JSON.parse(seatPlanData);

            // Check if the cinema hall already exists
            const existingHall = await db
                .select({
                    id: cinemaHall.id,
                    name: cinemaHall.name,
                })
                .from(cinemaHall)
                .where(eq(cinemaHall.name, name));

            let cinemaHallId;
            if (existingHall.length === 0) {
                // Insert a new cinema hall
                const insertedHall = await db
                    .insert(cinemaHall)
                    .values({ name: name, capacity: seats.length }) // Set capacity to the number of seats
                    .returning({ id: cinemaHall.id });

                cinemaHallId = insertedHall[0].id;
            } else {
                cinemaHallId = existingHall[0].id;

                // Update the capacity if the hall already exists
                await db
                    .update(cinemaHall)
                    .set({ capacity: seats.length })
                    .where(eq(cinemaHall.id, cinemaHallId));
            }

            // Map seat data with cinemaHall ID
            const seatsWithHall = seats.map((seat) => ({
                seatNumber: seat.seatNumber,
                row: seat.row,
                type: seat.type,
                cinemaHall: cinemaHallId,
                categoryId: seat.categoryId
            }));

            // Insert seat data into the database using Drizzle
            await db.insert(seat).values(seatsWithHall);

            shouldRedirect = true;

        } catch (error) {
            console.error('Error saving seats:', error);
            return fail(500, { error: true, message: error.message || 'Failed to save seat plan.' });
        }

        if (shouldRedirect) {
            throw redirect(303, '/admin/rooms');
        }
    },
} satisfies Actions;

export const load: PageServerLoad = async () => {
    const categories = await db.select().from(seatCategory);
    return { categories };
};
