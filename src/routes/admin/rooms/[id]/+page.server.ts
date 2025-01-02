import { db } from '$lib/server/db';
import { seat, cinemaHall, seatCategory, cinema } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { integer } from 'drizzle-orm/pg-core';

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


interface Seat { seatNumber: string; row: string; type: string; categoryId: number }

function organizeSeats(seats: Seat[]) {
    if (!seats || seats.length === 0) return null;

    // First, determine the dimensions of the grid
    let rows = new Set(seats.map(seat => seat.row));
    const rowArray = Array.from(rows);
    // A1 - B1 - D1 -> insert null for C1
    let lastLetter = '';
    rowArray.forEach((row, index) => {
        const letter = row.charAt(0);
        if (lastLetter) {
            const nextLetter = String.fromCharCode(lastLetter.charCodeAt(0) + 1);
            if (letter !== nextLetter && index != rows.size - 1) {

                rows.add(nextLetter);
            }
        }
        lastLetter = letter;
    });
    rows = new Set(Array.from(rows).sort());
    const maxSeatNumber = Math.max(...seats.map(seat =>
        parseInt(seat.seatNumber.replace(/[A-Z]/g, ''))));

    // Create sorted arrays of row letters and seat numbers
    const rowLetters = Array.from(rows).sort();
    const numColumns = maxSeatNumber;

    // Initialize the 2D array with nulls
    const seatGrid: (Seat | null)[][] = rowLetters.map(() =>
        Array(numColumns).fill(null)
    );

    // Place seats in their correct positions
    seats.forEach(seat => {
        const rowIndex = rowLetters.indexOf(seat.row);
        // Extract the number from seatNumber (e.g., "A1" -> 1)
        const seatNum = parseInt(seat.seatNumber.replace(/[A-Z]/g, ''));
        if (rowIndex !== -1 && seatNum > 0) {
            seatGrid[rowIndex][seatNum - 1] = seat;
        }
    });

    // Remove trailing null columns if they're empty in all rows
    let lastNonNullColumn = 0;
    for (let col = numColumns - 1; col >= 0; col--) {
        const hasSeatsInColumn = seatGrid.some(row => row[col] !== null);
        if (hasSeatsInColumn) {
            lastNonNullColumn = col;
            break;
        }
    }

    // Trim the arrays to remove unused columns
    return seatGrid.map(row => row.slice(0, lastNonNullColumn + 1));
}

// Helper function to validate the seat grid
function validateSeatGrid(grid: (Seat | null)[][]) {
    if (!grid || grid.length === 0) return false;

    const rowLengths = new Set(grid.map(row => row.length));
    if (rowLengths.size !== 1) {
        console.error('Inconsistent row lengths in seat grid');
        return false;
    }

    for (const row of grid) {
        for (let i = 0; i < row.length; i++) {
            const seat = row[i];
            if (seat !== null) {
                const seatNum = parseInt(seat.seatNumber.replace(/[A-Z]/g, ''));
                if (seatNum !== i + 1) {
                    console.error(`Seat number mismatch at position ${i}`, seat);
                    return false;
                }
            }
        }
    }

    return true;
}

// Example usage in the load function:
export const load: PageServerLoad = async ({ params }) => {
    const cinemas = await db.select().from(cinema);
    const categories = await db.select().from(seatCategory);
    const hall = await db.select().from(cinemaHall)
        .where(eq(cinemaHall.id, Number(params.id)))
        .limit(1);

    if (hall.length === 0) {
        return {
            categories,
            cinemaHall: null,
            seatPlan: null,
            cinemas
        };
    }

    const seats = await db.select().from(seat)
        .where(eq(seat.cinemaHall, Number(params.id)));

    const organizedSeats = seats.length > 0 ? organizeSeats(seats) : null;

    return {
        categories,
        cinemaHall: hall[0] || null,
        seatPlan: organizedSeats,
        cinemas
    };
};