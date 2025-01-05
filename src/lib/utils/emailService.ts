import { db } from '$lib/server/db';
import { eq, ne } from 'drizzle-orm';
import {
	booking,
	cinemaHall,
	film,
	seat,
	showing,
	ticket,
	ticketType,
	user,
	type Showing,
	type Ticket
} from '$lib/server/db/schema';
import nodemailer from 'nodemailer';

export class EmailService {
	private transporter: nodemailer.Transporter;
	private gmailUser: string;
	constructor(gmailUser: string, gmailAppPassword: string) {
		this.transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: gmailUser,
				pass: gmailAppPassword // App-Passwort, nicht normales Gmail-Passwort
			}
		});
		this.gmailUser = gmailUser;
	}
	async sendTicketConfirmation(ticketToSend: Ticket, recipientEmail: string): Promise<void> {
		const fullTicketInformation = await db
			.select()
			.from(ticket)
			.innerJoin(ticketType, eq(ticket.type, ticketType.id))
			.innerJoin(showing, eq(ticket.showingId, showing.id))
			.innerJoin(cinemaHall, eq(showing.hallid, cinemaHall.id))
			.innerJoin(film, eq(showing.filmid, film.id))
			.innerJoin(booking, eq(ticket.bookingId, booking.id))
			.innerJoin(user, eq(booking.userId, user.id))
			.innerJoin(seat, eq(ticket.seatId, seat.id))
			.where(eq(ticket.id, ticketToSend.id));

		const emailContent = this.generateTicketEmail(fullTicketInformation);

		try {
			await this.transporter.sendMail({
				from: `"CineHub Ticket Service" <${this.gmailUser}>`,
				to: recipientEmail,
				subject: `Ihre Kinokarte für ${fullTicketInformation[0].Film.title}`,
				html: emailContent
			});
		} catch (error) {
			console.error('Fehler beim Versenden der E-Mail:', error);
			throw new Error('E-Mail konnte nicht versendet werden');
		}
	}

	async sendCancelationConfirmation(showID: number, recipientEmail: string): Promise<void> {
		const affectedShow = await db
			.select()
			.from(showing)
			.innerJoin(film, eq(film.id, showing.filmid))
			.where(eq(showing.id, showID));
		const emailContent = this.generateCancelationEmail(affectedShow);

		try {
			await this.transporter.sendMail({
				from: `"CineHub Ticket Service" <${this.gmailUser}>`,
				to: recipientEmail,
				subject: `Stornierung der Vorstellung ${affectedShow[0].Film.title} am ${affectedShow[0].Showing.date}`,
				html: emailContent
			});
		} catch (error) {
			console.error('Fehler beim Versenden der E-Mail:', error);
			throw new Error('E-Mail konnte nicht versendet werden');
		}
	}

	private generateTicketEmail(
		tickets: {
			Ticket: {
				id: number;
				token: string | null;
				status: 'reserved' | 'paid' | 'validated';
				type: number | null;
				showingId: number | null;
				bookingId: number | null;
				seatId: number | null;
				price: string | null;
			};
			TicketType: {
				id: number;
				name: string | null;
				description: string | null;
				factor: string | null;
			};
			Showing: {
				date: string;
				id: number;
				filmid: number | null;
				hallid: number | null;
				priceSetId: number | null;
				time: string | null;
				endTime: string | null;
				language: string | null;
				dimension: string | null;
				cancelled: boolean | null;
				soldTickets: string | null;
			};
			Film: {
				id: number;
				description: string | null;
				imdbID: string | null;
				tmdbID: string | null;
				backdrop: string | null;
				title: string | null;
				genres: string[];
				director: string | null;
				runtime: number | null;
				ageRating: string | null;
				poster: string | null;
				year: string | null;
			};
			CinemaHall: { id: number; name: string | null; capacity: number | null; cinemaId: number };
			Booking: {
				date: string | null;
				id: number;
				time: string | null;
				totalPrice: string | null;
				userId: string | null;
				discount: number | null;
			};
			User: {
				id: string;
				address: string | null;
				googleId: string | null;
				githubId: string | null;
				lastName: string | null;
				firstName: string | null;
				email: string | null;
				password: string | null;
				role: 'user' | 'admin' | 'inspector';
			};
			seat: { id: number; seatNumber: string; row: string; cinemaHall: number; categoryId: number };
		}[]
	): string {
		let emailContent = '';
		for (const ticket of tickets) {
			emailContent += `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Ihre Kinokarte</h1>
          <p>Vielen Dank für Ihre Buchung!</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
            <h2>${tickets[0].Film.title}</h2>
            <p><strong>Datum:</strong> ${tickets[0].Showing.date}</p>
            <p><strong>Zeit:</strong> ${tickets[0].Showing.time}</p>
            <p><strong>Saal:</strong> ${tickets[0].CinemaHall.name}</p>
            <p><strong>Reihe</strong> ${tickets[0].seat.row}</p>
            <p><strong>Sitzplatz:</strong> ${tickets[0].seat.seatNumber}</p>
            <p><strong>Ticket-ID:</strong> ${tickets[0].Ticket.id}</p>
          </div>
  
          <p style="margin-top: 20px;">
            Bitte zeigen Sie diese E-Mail oder Ihre Ticket-ID beim Einlass vor.
          </p>
        </div>
      `;
		}
		return emailContent;
	}
	private generateCancelationEmail(
		show: {
			Showing: {
				date: string;
				id: number;
				filmid: number | null;
				hallid: number | null;
				priceSetId: number | null;
				time: string | null;
				endTime: string | null;
				language: string | null;
				dimension: string | null;
				cancelled: boolean | null;
				soldTickets: string | null;
			};
			Film: {
				id: number;
				imdbID: string | null;
				tmdbID: string | null;
				backdrop: string | null;
				title: string | null;
				genres: string[];
				director: string | null;
				runtime: number | null;
				ageRating: string | null;
				poster: string | null;
				description: string | null;
				year: string | null;
			};
		}[]
	): string {
		return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Sehr geehrte/r Kunde / Kundin,</p>               
        <p>wir bedauern Ihnen mitteilen zu müssen, dass die Vorstellung von ${show[0].Film.title} am ${show[0].Showing.date} um ${show[0].Showing.time} leider abgesagt werden muss.</p>        
        <p>Wir bitten Sie um Ihr Verständnis und entschuldigen uns für die Unannehmlichkeiten.</p>
        
        <p>Sie können für Ihr Ticket <a href="http://localhost:5173/refund">hier</a> eine volle Rückerstattung erhalten oder gegen ein Ticket für eine andere Vorstellung eintauschen.<p>
        
        <p>Mit freundlichen Grüßen,<p>        
        
        <p>Ihr CineHub-Team</p>
              </div>
            `;
	}
}
export interface fullTicket {
	id: number;
	token: string | null;
	status: string;
	price: string | null;
	sitzreihe: string;
	sitzplatz: string; // Update the type to string
	film: string;
	datum: string;
	uhrzeit: string;
	saal: string;
	showingId: number;
}
