import { db } from '$lib/server/db';
import { seat, cinemaHall, seatCategory, cinema, showing, ticket } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../../$types';

interface Seat {
    id: number,
    seatNumber: string;
    row: string;
    cinemaHall: number;
    categoryId: number,
    booked?: boolean
}

export const actions = {
    saveSeats: async ({ request }) => {
        let shouldRedirect = false;

        try {
            const formData = await request.formData();
            const seatPlanData = formData.get('seatPlanData');
            const name = formData.get('name');
            const cinemaId = formData.get('cinemaId');
            const hallId = formData.get('hallId');

            if (!name) throw new Error('No hall number provided');

            if (typeof seatPlanData !== 'string') throw new Error('Invalid seat plan data');

            const seats: Seat[] = JSON.parse(seatPlanData);

            // Check if the cinema hall already exists
            const existingHall = await db
                .select({
                    id: cinemaHall.id,
                    name: cinemaHall.name,
                })
                .from(cinemaHall)
                .where(eq(cinemaHall.id, Number(hallId)));

            let cinemaHallId;
            if (existingHall.length === 0) {
                // Insert a new cinema hall
                const insertedHall = await db
                    .insert(cinemaHall)
                    .values({ name: name?.toString() ?? '', capacity: seats.length, cinemaId: Number(cinemaId) })
                    .returning({ id: cinemaHall.id });

                cinemaHallId = insertedHall[0].id;
            } else {
                cinemaHallId = existingHall[0].id;

                // Update the capacity and name if the hall already exists
                await db
                    .update(cinemaHall)
                    .set({ capacity: seats.length, name: name!.toString() })
                    .where(eq(cinemaHall.id, cinemaHallId));
            }

            // Map seat data with cinemaHall ID
            const seatsWithHall = seats.map((seat) => ({
                seatNumber: seat.seatNumber,
                row: seat.row,
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

/*

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

*/

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
            if (seat.booked) {
                seatGrid[rowIndex][seatNum - 1] = { ...seat, booked: true };
            }
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

    // add in the already booked seats



    // Trim the arrays to remove unused columns
    return seatGrid.map(row => row.slice(0, lastNonNullColumn + 1));
}

export const load: PageServerLoad = async ({ params }) => {
    const showingId = params.showingId;

    const _showing = (await db.select().from(showing).where(eq(showing.id, Number(showingId))))[0];
    const tickets = await db.select().from(ticket).where(eq(ticket.showingId, Number(showingId)));
    const hall = (await db.select().from(cinemaHall).where(eq(cinemaHall.id, _showing.hallid)))[0];
    const seatsResp = await db.select().from(seat).where(eq(seat.cinemaHall, _showing.hallid));

    //set flag id seat is booked
    const seats = seatsResp.map(seat => {
        const ticket = tickets.find(ticket => ticket.seatId === seat.id);
        return ticket ? { ...seat, booked: true } : seat;
    });

    const organizedSeats = organizeSeats(seats);

    if (showing === undefined) {
        return fail(404, { error: true, message: 'Showing not found' });
    }

    console.log(organizedSeats);

    return {
        showing: _showing,
        hall,
        seatPlan: organizedSeats,
    };

    // const hall = await db.select().from(cinemaHall)
    //     .where(eq(cinemaHall.id, Number(prop)))
    //     .limit(1);

    // const seats = await db.select().from(seat)
    //     .where(eq(seat.cinemaHall, Number(prop)));

    // const organizedSeats = seats.length > 0 ? organizeSeats(seats) : null;

    // return {
    //     categories,
    //     cinemaHall: hall[0] || null,
    //     seatPlan: organizedSeats,
    //     cinemas
    // };
};