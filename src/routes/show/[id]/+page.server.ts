import { db } from '$lib/server/db';
import { seat, cinemaHall, seatCategory, showing, ticket, booking, ticketType, ticketStatusEnum, bookingEnum } from '$lib/server/db/schema';
import { eq, inArray, sql, and, ne} from 'drizzle-orm';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../../$types';
import { languageAwareGoto } from '$lib/utils/languageAware';



type SeatType = typeof seat.$inferSelect;

type Seat = SeatType & { booked?: boolean }

type SeatCategory = typeof seatCategory.$inferSelect;
interface SeatResponse {
    seat: Seat;
    seatCategory: SeatCategory;
}

type Showing = typeof showing.$inferSelect;

type CinemaHall = typeof cinemaHall.$inferSelect;

type Ticket = typeof ticket.$inferInsert;


export const actions = {

    //das hier funkctionert noch nicht
    bookSeats: async ({ request, locals }) => {
        let shouldRedirect = false;

        const formData = await request.formData();
        const showingId = Number(formData.get('showingId'));
        const seatIds = formData.getAll('seatIds').map(id => Number(id));
        const ticketTypes = formData.getAll('ticketTypes').map(id => Number(id));
        const price = formData.getAll('price').map(id => Number(id));

        try {

            const existingTickets = await db.select().from(ticket).where(and(eq(ticket.showingId, showingId), inArray(ticket.status, ['reserved', 'paid']), inArray(ticket.seatId, seatIds)));


            if (existingTickets.length > 0) {
                return fail(400, {
                    error: 'Some selected seats are no longer available'
                });
            }

            //check if booking exists on user
            let bookings = await db.select().from(booking).where(and(eq(booking.userId, locals.user!.id), ne(booking.status, "completed")));
            console.log("bookingres" + bookings);
            if (bookings.length == 0) {
                bookings = await db.insert(booking).values({
                    userId: locals.user!.id,                               
                }).returning();
            }


            const newBooking = bookings[0];
            const ticketsToCreate: Ticket[] = seatIds.map((seatId, index) => ({
                status: "reserved",
                showingId,
                bookingId: newBooking.id,
                seatId,
                type: ticketTypes[index],
                price: price[index].toString(),  // richtig berechnen -> evtl doch nicht nur die seatIds sondern die ganzen seat objekte übergeben
            }));


            await db
                .insert(ticket)
                .values(ticketsToCreate);

            shouldRedirect = true;
        } catch (error) {
            console.error('Error creating tickets:', error);
            return fail(500, {
                error: 'Failed to book seats. Please try again.'
            });
        }
        if (shouldRedirect) {
            throw redirect(303, '/cart');
        }
    }
} satisfies Actions;



export const load: PageServerLoad = async ({ params }) => {
    const showingId = params.id;

    const _showing = (await db.select().from(showing).where(eq(showing.id, Number(showingId))))[0];
    const tickets = await db.select().from(ticket).where(eq(ticket.showingId, Number(showingId)));
    const hall = (await db.select().from(cinemaHall).where(eq(cinemaHall.id, _showing.hallid!)))[0];
    const seatsResp: SeatResponse[] = await db.select().from(seat).leftJoin(seatCategory, eq(seat.categoryId, seatCategory.id)).where(eq(seat.cinemaHall, _showing.hallid!)) as SeatResponse[];
    const ticketTypes = await db.select().from(ticketType); // maybe only get the ones which are used in this hall/showing

    //set flag if seat is booked
    const _seatsResp = seatsResp.map(seatResp => {
        const ticket = tickets.find(ticket => ticket.seatId === seatResp.seat.id);
        return ticket ? { seat: { ...seatResp.seat, booked: true }, seatCategory: seatResp.seatCategory } : seatResp;
    });

    const organizedSeatsResponse = organizeSeats(_seatsResp);


    if (showing === undefined) {
        return fail(404, { error: true, message: 'Showing not found' });
    }

    console.log(organizedSeatsResponse);

    return {
        showing: _showing,
        hall,
        seatPlan: organizedSeatsResponse,
        ticketTypes
    };
};

function organizeSeats(seatResponses: SeatResponse[]): (SeatResponse | null)[][] | null {
    if (!seatResponses || seatResponses.length === 0) return null;

    // Determine all rows
    let rows = new Set(seatResponses.map((seatResp) => seatResp.seat.row));
    const rowArray = Array.from(rows);

    // Fill in missing rows (e.g., A, B, D -> insert C)
    let lastLetter = '';
    rowArray.forEach((row, index) => {
        const letter = row.charAt(0);
        if (lastLetter) {
            const nextLetter = String.fromCharCode(lastLetter.charCodeAt(0) + 1);
            if (letter !== nextLetter && index != rows.size - 1) {
                rows.add(nextLetter); // Add missing row
            }
        }
        lastLetter = letter;
    });

    rows = new Set(Array.from(rows).sort());
    const maxSeatNumber = Math.max(
        ...seatResponses.map((seatResp) =>
            parseInt(seatResp.seat.seatNumber.replace(/[A-Z]/g, ''))
        )
    );

    // Create sorted arrays of row letters and seat numbers
    const rowLetters = Array.from(rows).sort();
    const numColumns = maxSeatNumber;

    // Initialize the 2D array with nulls
    const seatGrid: (SeatResponse | null)[][] = rowLetters.map(() =>
        Array(numColumns).fill(null)
    );

    // Place seats in their correct positions
    seatResponses.forEach((seatResp) => {
        const { seat } = seatResp;
        const rowIndex = rowLetters.indexOf(seat.row);
        const seatNum = parseInt(seat.seatNumber.replace(/[A-Z]/g, ''));
        if (rowIndex !== -1 && seatNum > 0) {
            seatGrid[rowIndex][seatNum - 1] = seatResp;
        }
    });

    // Remove trailing null columns if they're empty in all rows
    let lastNonNullColumn = 0;
    for (let col = numColumns - 1; col >= 0; col--) {
        const hasSeatsInColumn = seatGrid.some((row) => row[col] !== null);
        if (hasSeatsInColumn) {
            lastNonNullColumn = col;
            break;
        }
    }

    // Trim the arrays to remove unused columns
    return seatGrid.map((row) => row.slice(0, lastNonNullColumn + 1));
}

