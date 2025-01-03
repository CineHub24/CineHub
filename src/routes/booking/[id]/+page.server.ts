import { db } from '$lib/server/db';
import { ticket, 
    seat, 
    cinemaHall, 
    cinema, 
    showing, 
    film, 
    booking,
    seatCategory,
    ticketType,
    priceDiscount } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, asc, and } from 'drizzle-orm';

export const load = async ({ url }) => {
	let bookingId = <unknown>url.pathname.replace('/booking/', '');
	try {
        // const bookings = await db
        //     .select()
        //     .from(booking)
        //     .where(eq(booking.id, <number>bookingId));
        // if(bookings.length != 1) {
        //     throw error(500, 'Internal Server Error DB');
        // }
        // const foundBooking = bookings[0]

        const ticketsWithDetails = await db
        .select({
        // Ticket Info
        ticketId: ticket.id,
        ticketStatus: ticket.status,
        
        // Seat Info
        seatNumber: seat.seatNumber,
        seatRow: seat.row,
        
        // Seat Category Info
        seatType: seatCategory.name,
        
        // Ticket Type Info
        ticketTypeName: ticketType.name,
        
        // Location Info
        hallName: cinemaHall.name,
        cinemaAddress: cinema.address,
        
        // Movie Info
        movieTitle: film.title,
        moviePoster: film.poster,
        
        // Showing Info
        showingDate: showing.date,
        showingTime: showing.time,
        showingLanguage: showing.language,
        showingDimension: showing.dimension,
        
        // Booking Info
        bookingDate: booking.date,
        bookingTime: booking.time,
        bookingTotalPrice: booking.totalPrice,
        
        // Discount Info
        discountCode: priceDiscount.code,
        discountValue: priceDiscount.value
        })
        .from(ticket)
        .leftJoin(seat, eq(ticket.seatId, seat.id))
        .leftJoin(seatCategory, eq(seat.categoryId, seatCategory.id))
        .leftJoin(ticketType, eq(ticket.type, ticketType.id))
        .leftJoin(cinemaHall, eq(seat.cinemaHall, cinemaHall.id))
        .leftJoin(cinema, eq(cinemaHall.cinemaId, cinema.id))
        .leftJoin(showing, eq(ticket.showingId, showing.id))
        .leftJoin(film, eq(showing.filmid, film.id))
        .leftJoin(booking, eq(ticket.bookingId, booking.id))
        .leftJoin(priceDiscount, eq(booking.discount, priceDiscount.id))
        .where(eq(ticket.bookingId, <number>bookingId));

		return {
            //booking: foundBooking,
            tickets: ticketsWithDetails,
		};
	} catch (e) {
		console.log(e);
		throw error(500, 'Internal Server Error DB');
	}
};
