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
import { error, fail, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, asc, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { EmailService } from '$lib/utils/emailService';
import { tick } from 'svelte';
import { languageAwareRedirect } from '$lib/utils/languageAware';


//export const load = async ({ url }) => {
export const load: PageServerLoad = async ({ locals, url, params }) => {
    const gmailUser = import.meta.env.VITE_GMAIL_USER;
	const gmailAppPassword = import.meta.env.VITE_GMAIL_APP_PASSWORD;
    const emailClient = new EmailService(gmailUser, gmailAppPassword);
    
    // Fetch user information from locals
    if (!locals.user) {
        return fail(401, { error: 'Unauthorized' });
    }
    const user = locals.user;

    // Fetch booking information
	
    const{ id } = params;
    const bookingId = id;
    console.log("bookingid" + bookingId);
    const initial = url.searchParams.get('initial');
    console.log(initial)

    try{
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
        cinemaName: cinema.name,
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
        bookingId: booking.id,
        bookingDate: booking.date,
        bookingTime: booking.time,
        bookingTotalPrice: booking.finalPrice,
        bookingStatus: booking.status,
        
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
        .where(and(eq(ticket.bookingId, Number(bookingId)), eq(booking.userId, user.id)));
        console.log("Tickets with details");
        console.log(ticketsWithDetails);

        // await db.update(ticket).set({ status: 'paid' }).where(eq(ticket.bookingId, Number(bookingId)));
        // await emailClient.sendBookingConfirmation(Number(bookingId), user.email as string);

        if (ticketsWithDetails[0].bookingStatus == 'completed') {
            return {
                //booking: foundBooking,
                user: user,
                tickets: ticketsWithDetails,
            };
        }

		
	} catch (e) {
		console.log(e);
		throw error(500, 'Internal Server Error DB');
	}
    return languageAwareRedirect(302, '/profile/bookings');
};
