import { db } from '$lib/server/db';
import { seat, cinemaHall, seatCategory, cinema } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../../$types';

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
            const cinemaId = formData.get('cinemaId');

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
                .where(eq(cinemaHall.name, name.toString()));

            let cinemaHallId;
            if (existingHall.length === 0) {
                // Insert a new cinema hall
                const insertedHall = await db
                    .insert(cinemaHall)
                    .values({ name: name?.toString() ?? '', capacity: seats.length, cinemaId: cinemaId }) // Set capacity to the number of seats
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
                categoryId: seat.categoryId,

            }));
            console.log(seatsWithHall);
            // delete existing seats and insert new ones
            await db.delete(seat).where(eq(seat.cinemaHall, cinemaHallId));
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

export const load: PageServerLoad = async ({ params }) => {
    //check if the hall exists and if not return an empty hall
    const cinemas = await db.select().from(cinema);
    const categories = await db.select().from(seatCategory);
    const hall = await db.select().from(cinemaHall).where(eq(cinemaHall.id, Number(params.id))).limit(1);
    if (hall.length === 0) {
        return {
            categories,
            cinemaHall: null,
            seatPlan: null,
            cinemas
        };
    }
    const seatPlan = await db.select().from(seat).where(eq(seat.cinemaHall, Number(params.id)));
    //maybe only return the categories that are used in the hall by checking the Priceset

    // console.log('cinemas', cinemas);
    return {
        categories,
        cinemaHall: hall[0] || null,
        seatPlan: seatPlan.length > 0 ? organizeSeats(seatPlan) : null,
        cinemas
    };
};

function organizeSeats(seats: any[]) {
    const rows: Record<string, any[]> = {};
    seats.forEach(seat => {
        if (!rows[seat.row]) rows[seat.row] = [];
        rows[seat.row].push(seat);
    });
    return Object.values(rows).map(row => row.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber)));
}