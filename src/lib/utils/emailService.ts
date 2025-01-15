import { db } from '$lib/server/db';
import { eq, ne } from 'drizzle-orm';
import {
	booking,
	cinema,
	cinemaHall,
	film,
	seat,
	showing,
	ticket,
	ticketType,
	user,
	type Discount,
	type Showing,
	type Ticket
} from '$lib/server/db/schema';
import nodemailer from 'nodemailer';
import ical from 'ical-generator';
import PDFDocument from 'pdfkit';
import path from 'path';
import QRCode from 'qrcode';
import axios from 'axios';



export class EmailService {
	private transporter: nodemailer.Transporter;
	private gmailUser: string;
	private PUBLIC_URL: string = import.meta.env.VITE_PUBLIC_URL;

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
	private async generatePDFTicket(ticketInfo: {
		Ticket: {
			token: string | null;
			id: number;
			type: number | null;
			status: 'reserved' | 'paid' | 'validated';
			showingId: number | null;
			bookingId: number | null;
			seatId: number | null;
			price: string | null;
		};
		TicketType: {
			name: string | null;
			id: number;
			description: string | null;
			factor: string | null;
		};
		Showing: {
			date: string;
			id: number;
			time: string | null;
			filmid: number | null;
			hallid: number | null;
			priceSetId: number | null;
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
		CinemaHall: { name: string | null; id: number; capacity: number | null; cinemaId: number };
		Cinema: {
			name: string | null;
			id: number;
			address: string | null;
			opentime: string | null;
			closeTime: string | null;
			numScreens: number | null;
		};
		seat: { id: number; seatNumber: string; row: string; cinemaHall: number; categoryId: number };
	}): Promise<Buffer> {
		return new Promise(async (resolve) => {
			const doc = new PDFDocument({
				size: 'A4',
				margin: 50
			});
			const poster = ticketInfo.Film.poster;
			const backdrop = ticketInfo.Film.backdrop;
			const qrData = JSON.stringify({ id: ticketInfo.Ticket.id, token: ticketInfo.Ticket.token });
			let qrCode;
			try {
				qrCode = await QRCode.toDataURL(qrData, { width: 1000, margin: 1 });
			} catch (err) {
				console.error('QR Code Generierung fehlgeschlagen:', err);
			}

			const chunks: Buffer[] = [];
			doc.on('data', (chunk) => chunks.push(chunk));
			doc.on('end', () => resolve(Buffer.concat(chunks)));

			// Header mit Backdrop und Logo
			doc.rect(50, 50, 500, 60).stroke();

			// Backdrop oben links
			if (ticketInfo.Film.backdrop) {
				try {
					const backdropUrl = `https://image.tmdb.org/t/p/w500${ticketInfo.Film.backdrop}`;
					const response = await axios.get(backdropUrl, { responseType: 'arraybuffer' });
					const backdropBuffer = Buffer.from(response.data, 'binary');
					doc.image(backdropBuffer, 50, 50, {
						width: 2000,
						height: 60,
						fit: [2000, 60]
					});
				} catch (error) {
					console.error('Fehler beim Laden des Backdrops:', error);
				}
			}

			// Logo oben rechts
			try {
				doc.image('/favicon_white_bg.png', 490, 55, { width: 50, height: 50 });
			} catch (error) {
				console.error('Fehler beim Laden des Logos:', error);
				doc.text('CineHub', 490, 70);
			}

			// Titel (Mitte)
			doc.fontSize(12);
			doc.fontSize(24).text('Online-Ticket', 125, 70, { align: 'center' });
			doc.fontSize(12);
			// Hauptinformationen
			doc.moveDown(2);
			doc.text(`Ort: CineHub ${ticketInfo.Cinema.address}`, 50, 130);
			doc.text(`Saal: ${ticketInfo.CinemaHall.name}`, 50, 150);
			doc.text(`Film: ${ticketInfo.Film.title}`, 50, 170);
			doc.text(`Datum: ${ticketInfo.Showing.date}`, 50, 190);
			doc.text(`Spielzeit: ${ticketInfo.Showing.time} Uhr`, 50, 210);

			// Ticketinformationen
			doc.text(
				`${ticketInfo.TicketType.name} - Reihe ${ticketInfo.seat.row} Platz ${ticketInfo.seat.seatNumber}`,
				50,
				240
			);

			doc.moveTo(50, 270).lineTo(550, 270).dash(1, { space: 2 }).stroke();

			// QR Code
			if (qrCode) {
				doc.image(qrCode, 50, 290, { width: 100, height: 100 });
			} else {
				doc.rect(50, 290, 100, 100).stroke();
				doc.text('QR-Code', 75, 330, { align: 'center' });
			}

			// Poster rechts neben den Hauptinformationen
			if (ticketInfo.Film.poster) {
				try {
					const response = await axios.get(ticketInfo.Film.poster, { responseType: 'arraybuffer' });
					const posterBuffer = Buffer.from(response.data, 'binary');
					doc.image(posterBuffer, 463, 130, { width: 87, height: 130 });
				} catch (error) {
					console.error('Fehler beim Laden des Posters:', error);
				}
			}

			// Preisinformationen
			doc.text(`Preis gesamt: ${ticketInfo.Ticket.price} €`, 50, 410);
			doc.text(`Transaktions-Nr.: ${ticketInfo.Ticket.token}`, 50, 430);
			doc.text(`Ticket-ID: ${ticketInfo.Ticket.id}`, 50, 450);

			// Informationstext
			doc.moveDown(4);
			doc.text('Lieber CineHub Gast,', 50, 480);
			doc.text('bitte beachten Sie folgende Infos:', 50, 500);

			doc.moveDown();
			doc.text('Nutzen Sie dieses Online-Ticket als Eintrittskarte.', 50, 530);

			doc.moveDown();
			doc.fontSize(10);
			doc.text(
				'Dieses PDF ist die Eintrittskarte für Ihren Kinobesuch. Bitte bringen Sie dieses Online-Ticket mit ins CineHub, entweder auf Ihrem Smartphone oder als Ausdruck und gehen Sie damit direkt zum Einlass.',
				50,
				550,
				{
					width: 500,
					align: 'justify'
				}
			);

			// Verfallsinformation
			doc.moveDown(2);
			doc.text('Verfallen der Tickets:', 50, 600);
			doc.text(
				'Bitte beachten Sie, dass Online-Tickets 45 Minuten nach Beginn der Vorstellung verfallen und nicht mehr zum Einlass berechtigen.',
				50,
				620,
				{
					width: 500,
					align: 'justify'
				}
			);

			// FSK Hinweis
			doc.moveDown(2);
			doc.text('FSK und Jugendschutz:', 50, 670);
			doc.text(
				'Bitte beachten Sie, dass die FSK, das Jugendschutzgesetz und eventuelle Ermäßigungen von uns am Einlass nachgehalten werden.',
				50,
				690,
				{
					width: 500,
					align: 'justify'
				}
			);

			// Abschluss
			doc.moveDown(2);
			doc.text(
				'Wir bedanken uns für Ihren Ticketkauf und wünschen Ihnen gute Unterhaltung im Kino.',
				50,
				730
			);
			doc.moveDown();
			doc.text('Ihr CineHub-Team', 50, 760);

			doc.end();
		});
	}

	async sendBookingConfirmation(bookingId: number, recipientEmail: string): Promise<void> {
		// Hole alle Tickets für diese Buchung
		const bookingInformation = await db
			.select()
			.from(booking)
			.where(eq(booking.id, bookingId))
			.innerJoin(user, eq(booking.userId, user.id));

		const tickets = await db
			.select()
			.from(ticket)
			.where(eq(ticket.bookingId, bookingId))
			.innerJoin(ticketType, eq(ticket.type, ticketType.id))
			.innerJoin(showing, eq(ticket.showingId, showing.id))
			.innerJoin(cinemaHall, eq(showing.hallid, cinemaHall.id))
			.innerJoin(film, eq(showing.filmid, film.id))
			.innerJoin(seat, eq(ticket.seatId, seat.id))
			.innerJoin(cinema, eq(cinema.id, cinemaHall.cinemaId));
		console.log(tickets);
		// Gruppiere Tickets nach Vorstellung
		const ticketsByShowing: { [key: number]: any[] } = tickets.reduce(
			(acc: { [key: number]: any[] }, ticket) => {
				const showingId = ticket.Showing.id;
				if (!acc[showingId]) {
					acc[showingId] = [];
				}
				acc[showingId].push(ticket);
				return acc;
			},
			{}
		);
		console.log('ticketsByShowing');

		// Generiere PDF für jedes Ticket
		const pdfPromises = tickets.map((ticket) => this.generatePDFTicket(ticket));
		const pdfBuffers = await Promise.all(pdfPromises);

		// Erstelle E-Mail-Inhalt
		let emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>Ihre Buchungsbestätigung</h1>
    <p>Sehr geehrte/r Kunde/in,</p>
    <p>vielen Dank für Ihre Buchung!</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
    <h2>Buchungsdetails</h2>
    <p><strong>Buchungs-Nr:</strong> ${bookingId}</p>
    <p><strong>Gesamtpreis:</strong> ${bookingInformation[0].Booking.finalPrice} €</p>
    </div>
    `;
		console.log(emailContent);
		// Füge Details für jede Vorstellung hinzu
		for (const [showingId, showingTickets] of Object.entries(ticketsByShowing)) {
			const showing = showingTickets[0].Showing;
			emailContent += `
    <div style="margin-top: 20px; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
    <h3>${showingTickets[0].Film.title}</h3>
    <p><strong>Datum:</strong> ${showing.date}</p>
    <p><strong>Zeit:</strong> ${showing.time}</p>
    <p><strong>Saal:</strong> ${showingTickets[0].CinemaHall.name}</p>
    <p><strong>Preis:</strong> ${showingTickets[0].Ticket.price} €</p>
    `;
			for (const ticket of showingTickets) {
				emailContent += `
      <p><strong>Ticket-ID:</strong> ${ticket.Ticket.id}</p>
      <p><strong>Reihe:</strong> ${ticket.seat.row}</p>
      <p><strong>Sitzplatz:</strong> ${ticket.seat.seatNumber}</p>      
      `;
			}
			emailContent += '</div>';
		}

		emailContent += `
    <p>Ihre Tickets finden Sie im Anhang dieser E-Mail.</p>
    <p>Bitte bringen Sie die Tickets ausgedruckt oder digital zur Vorstellung mit.</p>
    
    <p>Mit freundlichen Grüßen,<br>Ihr CineHub-Team</p>
    </div>
    `;

		// Generiere ICS-Dateien für jede Vorstellung
		const icsPromises = Object.values(ticketsByShowing).map((showingTickets) =>
			this.generateICSFile(showingTickets[0])
		);
		const icsContents = await Promise.all(icsPromises);

		// Sende E-Mail mit PDF-Anhängen und ICS-Dateien
		try {
			await this.transporter.sendMail({
				from: `"CineHub Ticket Service" <${this.gmailUser}>`,
				to: recipientEmail,
				subject: `Ihre Buchungsbestätigung`,
				html: emailContent,
				attachments: [
					// PDF Tickets
					...pdfBuffers.map((buffer, index) => ({
						filename: `ticket-${tickets[index].Ticket.id}.pdf`,
						content: buffer,
						contentType: 'application/pdf'
					})),
					// ICS Dateien
					...icsContents.map((content, index) => ({
						filename: `kinovorstellung-${index + 1}.ics`,
						content: content,
						contentType: 'text/calendar'
					}))
				]
			});
		} catch (error) {
			console.error('Fehler beim Versenden der E-Mail:', error);
			throw new Error('E-Mail konnte nicht versendet werden');
		}
	}

	async sendResetPasswordEmail(resetToken: string, recipientEmail: string): Promise<void> {
		const emailContent = `
      Hallo,

Wir haben deine Anfrage zur Passwort-Zurücksetzung erhalten.

Klicke auf den folgenden Link, um ein neues Passwort festzulegen: <a href="${this.PUBLIC_URL}/login/reset-password?token=${resetToken}"> Passwort zurücksetzen </a>

Dieser Link ist nur einmal verwendbar und verfällt in 15 Minuten.

Ihr Cinehub-Team
      `;

		try {
			await this.transporter.sendMail({
				from: `"CineHub" <${this.gmailUser}>`,
				to: recipientEmail,
				subject: `Passwort-Zurücksetzung für CineHub`,
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
        
        <p>Sie können für Ihr Ticket <a href="${this.PUBLIC_URL}/refund">hier</a> eine volle Rückerstattung erhalten oder gegen ein Ticket für eine andere Vorstellung eintauschen.<p>
        
        <p>Mit freundlichen Grüßen,<p>        
        
        <p>Ihr CineHub-Team</p>
              </div>
            `;
	}
	private async generateICSFile(showingInfo: {
		Film: { title: string | null };
		Showing: { date: string; time: string | null; endTime: string | null };
		CinemaHall: { name: string | null; cinemaId: number };
	}): Promise<string> {
		const calendar = ical({ name: 'Kinovorstellung' });

		// Parse date and time
		const [year, month, day] = showingInfo.Showing.date.split('-');
		const [hours, minutes] = showingInfo.Showing.time?.split(':') || ['00', '00'];

		// Create start date
		const startDate = new Date(
			parseInt(year),
			parseInt(month) - 1,
			parseInt(day),
			parseInt(hours),
			parseInt(minutes)
		);

		// Create end date (using endTime if available, otherwise add 2.5 hours as default)
		let endDate;
		if (showingInfo.Showing.endTime) {
			const [endHours, endMinutes] = showingInfo.Showing.endTime.split(':');
			endDate = new Date(
				parseInt(year),
				parseInt(month) - 1,
				parseInt(day),
				parseInt(endHours),
				parseInt(endMinutes)
			);
		} else {
			endDate = new Date(startDate.getTime() + 2.5 * 60 * 60 * 1000); // Add 2.5 hours
		}
		const cinemas = await db
			.select()
			.from(cinema)
			.where(eq(cinema.id, showingInfo.CinemaHall.cinemaId));
		calendar.createEvent({
			start: startDate,
			end: endDate,
			summary: showingInfo.Film.title || 'Kinovorstellung',
			description: `Kinovorstellung: ${showingInfo.Film.title}\nSaal: ${showingInfo.CinemaHall.name}`,
			location: `${cinemas[0].name}, ${cinemas[0].address}`
		});

		return calendar.toString();
	}
	async sendDiscountCode(email: string, discount:Discount ): Promise<void> {
		console.log('discount', discount);
		console.log('email', email);
		const emailContent = `
	  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
	  <p>Hey Filmfan,</p>
	  
	  <p>wir freuen uns, Ihnen einen Rabattcode für Ihren nächsten Kinobesuch anzubieten.</p>
	  
	  <p>Rabattcode: ${discount.code}</p>
	  <p>Wert: ${discount.value} ${discount.discountType === 'percentage' ? '%' : '€'}</p>
	  <p>Gültig bis: ${discount.expiresAt}</p>
	  
	  <p>Ihr Cinehub-Team</p>
	  </div>
	  `;

		try {
			await this.transporter.sendMail({
				from: `"CineHub" <${this.gmailUser}>`,
				to: email,
				subject: `Ihr Rabattcode für CineHub`,
				html: emailContent
			});
		} catch (error) {
			console.error('Fehler beim Versenden der E-Mail:', error);
			throw new Error('E-Mail konnte nicht versendet werden');
		}
	}
	async sendWelcomeEmail(email: string): Promise<void> {
	
		const emailContent = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
		<p>Hallo Filmfan,<p>

<p>Herzlich willkommen im CineHub! Wir freuen uns sehr, dass du nun Teil unserer Film-Familie bist.<p>

<p>Bereit für unvergessliche Kinoerlebnisse? Dann Tauche ein in die Welt des Films und sei einer der Ersten, die neue Blockbuster erleben.</p>

<p>Wir wünschen dir viel Spaß und gute Unterhaltung!</p>

<p>Ihr Cinema-Team</p>
		
</div>		
		`;
		try {
			await this.transporter.sendMail({
				from: `"CineHub" <${this.gmailUser}>`,
				to: email,
				subject: `Willkommen im CineHub`,
				html: emailContent
			});
		} catch (error) {
			console.error('Fehler beim Versenden der E-Mail:', error);
			throw new Error('E-Mail konnte nicht versendet werden');
		}

	
	}



	async sendNewsletter(emails: string[], subject: string, htmlContent: string): Promise<void> {
		try {
			// Send emails in batches of 50 to avoid overwhelming the mail server
			const batchSize = 50;
			for (let i = 0; i < emails.length; i += batchSize) {
				const batch = emails.slice(i, i + batchSize);
				const emailPromises = batch.map((email) => {
					// Add unsubscribe footer for each email
					const unsubscribeUrl = `${this.PUBLIC_URL}/api/unsubscribe/${encodeURIComponent(email)}`;
					const emailWithUnsubscribe = `
          ${htmlContent}
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-family: Arial, sans-serif; font-size: 14px; color: #64748b;">
              <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Newsletter abbestellen</a>
          </div>
          `;

					return this.transporter.sendMail({
						from: `"CineHub Newsletter" <${this.gmailUser}>`,
						to: email,
						subject: subject,
						html: emailWithUnsubscribe
					});
				});
				await Promise.all(emailPromises);
			}
		} catch (error) {
			console.error('Fehler beim Versenden der Newsletter:', error);
			throw new Error('Newsletter konnte nicht versendet werden');
		}
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
