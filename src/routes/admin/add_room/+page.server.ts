import { db } from '$lib/server/db';
import { seat, cinemaHall } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, type Actions } from '@sveltejs/kit';

interface SeatPlan {
    seatNumber: string;
    row: string;
    type: string;
}

export const actions = {
    saveSeats: async ({ request }) => {
        try {
            const formData = await request.formData();
            const seatPlanData = formData.get('seatPlanData');
            const hallNumber = formData.get('hallNumber');

            if (!hallNumber) throw new Error('No hall number provided');

            if (typeof seatPlanData !== 'string') throw new Error('Invalid seat plan data');

            const seats: SeatPlan[] = JSON.parse(seatPlanData);

            const existingHall = await db
                .select({
                    id: cinemaHall.id,
                    hallNumber: cinemaHall.hallNumber,
                })
                .from(cinemaHall)
                .where(eq(cinemaHall.hallNumber, Number(hallNumber)));

            let cinemaHallId;
            if (existingHall.length === 0) {
                const insertedHall = await db
                    .insert(cinemaHall)
                    .values({ hallNumber: Number(hallNumber), capacity: 100 }) // Default capacity; adjust as needed
                    .returning({ id: cinemaHall.id });

                cinemaHallId = insertedHall[0].id;
            } else {
                cinemaHallId = existingHall[0].id;
            }


            // Map seat data with cinemaHall ID
            const seatsWithHall = seats.map((seat) => ({
                seatNumber: seat.seatNumber,
                row: seat.row,
                type: seat.type,
                cinemaHall: cinemaHallId,
            }));

            // Insert seat data into the database using Drizzle
            await db.insert(seat).values(seatsWithHall);

            return { success: true, message: 'Seat plan saved successfully!' };
        } catch (error) {
            console.error('Error saving seats:', error);
            return fail(500, { error: true, message: error.message || 'Failed to save seat plan.' });
        }
    },
} satisfies Actions;
