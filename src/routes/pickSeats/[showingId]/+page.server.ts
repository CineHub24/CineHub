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
    submitSeats: async ({ request }) => {
        const formData = await request.formData();
        const selectedSeatIds = JSON.parse(formData.get('selectedSeatIds') as string);
        const showingId = formData.get('showingId');

        try {
            // Save selected seats to the database or process booking logic
            for (const seatId of selectedSeatIds) {
                await db.insert(ticket).values({
                    showingId: Number(showingId),
                    seatId: seatId,
                    status: 'booked'
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error processing seat booking:', error);
            return { error: true, message: 'Failed to book seats.' };
        }
    }
};

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