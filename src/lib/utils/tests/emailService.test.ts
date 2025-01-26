import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from '$lib/utils/emailService';
import nodemailer from 'nodemailer';
import { db } from '$lib/server/db';
import QRCode from 'qrcode';
import axios from 'axios';
import ical from 'ical-generator';
import PDFDocument from 'pdfkit';
import type { Discount } from '$lib/server/db/schema';

// Mock external dependencies
vi.mock('nodemailer');
vi.mock('$lib/server/db');
vi.mock('qrcode');
vi.mock('axios');
vi.mock('ical-generator');
vi.mock('pdfkit');

describe('EmailService', () => {
	let emailService: EmailService;
	const mockTransporter = {
		sendMail: vi.fn().mockResolvedValue({ messageId: 'mock-message-id' })
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
		emailService = new EmailService('test@example.com', 'password');
	});

	// describe('sendBookingConfirmation', () => {
	// 	it('should send a booking confirmation email', async () => {
	// 		const bookingId = 1;
	// 		const recipientEmail = 'user@example.com';

	// 		// Erstellen Sie eine Mock-Funktion, die die Verkettung simuliert
	// 		const mockChain = {
	// 			from: vi.fn().mockReturnThis(),
	// 			where: vi.fn().mockReturnThis(),
	// 			innerJoin: vi.fn().mockReturnThis(),
	// 			$: vi.fn()
	// 		};

	// 		// Mock für die erste Datenbankabfrage (Booking und User)
	// 		mockChain.$.mockResolvedValueOnce([
	// 			{
	// 				Booking: { id: 1, finalPrice: '50.00', date: '2023-06-01' },
	// 				User: { firstName: 'John', lastName: 'Doe' }
	// 			}
	// 		]);

	// 		// Mock für die zweite Datenbankabfrage (Tickets)
	// 		mockChain.$.mockResolvedValueOnce([
	// 			{
	// 				id: 1,
	// 				token: 'abc123',
	// 				price: '10.00',
	// 				ticketType: { name: 'Adult' },
	// 				showing: {
	// 					id: 1,
	// 					date: '2023-06-01',
	// 					time: '20:00',
	// 					film: { title: 'Test Movie' },
	// 					cinemaHall: {
	// 						name: 'Hall 1',
	// 						cinema: { id: 1, name: 'CineHub', address: '123 Movie St' }
	// 					}
	// 				},
	// 				seat: { row: 'A', seatNumber: '5' }
	// 			}
	// 		]);

	// 		// Mock für die dritte Datenbankabfrage (Rabatte)
	// 		mockChain.$.mockResolvedValueOnce([
	// 			{
	// 				priceDiscount: {
	// 					code: 'DISCOUNT10',
	// 					value: '10.00',
	// 					discountType: 'percentage',
	// 					expiresAt: '2023-12-31'
	// 				}
	// 			}
	// 		]);

	// 		// Setze die gemockte Kette auf das db-Objekt
	// 		(db.select as jest.Mock).mockReturnValue(mockChain);

	// 		// Mock generatePDFTicket method
	// 		emailService.generatePDFTicket = vi.fn().mockResolvedValue(Buffer.from('mock-pdf-data'));

	// 		// Mock PDF generation
	// 		(PDFDocument as unknown as jest.Mock).mockImplementation(() => ({
	// 			on: vi.fn(),
	// 			rect: vi.fn().mockReturnThis(),
	// 			stroke: vi.fn().mockReturnThis(),
	// 			image: vi.fn().mockReturnThis(),
	// 			fontSize: vi.fn().mockReturnThis(),
	// 			text: vi.fn().mockReturnThis(),
	// 			moveDown: vi.fn().mockReturnThis(),
	// 			moveTo: vi.fn().mockReturnThis(),
	// 			lineTo: vi.fn().mockReturnThis(),
	// 			dash: vi.fn().mockReturnThis(),
	// 			end: vi.fn()
	// 		}));

	// 		// Mock QR code generation
	// 		(QRCode.toDataURL as jest.Mock).mockResolvedValue('mock-qr-code');

	// 		// Mock axios for image fetching
	// 		(axios.get as jest.Mock).mockResolvedValue({ data: Buffer.from('mock-image-data') });

	// 		// Mock ical generation
	// 		(ical as unknown as jest.Mock).mockReturnValue({
	// 			createEvent: vi.fn().mockReturnThis(),
	// 			toString: vi.fn().mockReturnValue('mock-ics-content')
	// 		});

	// 		await emailService.sendBookingConfirmation(bookingId, recipientEmail);

	// 		// Überprüfen Sie, ob die sendMail-Funktion aufgerufen wurde
	// 		expect(mockTransporter.sendMail).toHaveBeenCalled();

	// 		// Überprüfen Sie den Inhalt der E-Mail
	// 		const emailCall = mockTransporter.sendMail.mock.calls[0][0];
	// 		expect(emailCall.to).toBe(recipientEmail);
	// 		expect(emailCall.subject).toBe('Ihre Buchungsbestätigung');
	// 		expect(emailCall.html).toContain('Ihre Buchungsbestätigung');
	// 		expect(emailCall.attachments).toHaveLength(2); // Ein PDF und eine ICS-Datei
	// 		expect(emailCall.attachments[0].filename).toMatch(/ticket-.*\.pdf/);
	// 		expect(emailCall.attachments[1].filename).toMatch(/kinovorstellung-.*\.ics/);
	// 	});
	// });

	describe('sendResetPasswordEmail', () => {
		it('should send a password reset email', async () => {
			const resetToken = 'mock-reset-token';
			const recipientEmail = 'user@example.com';

			await emailService.sendResetPasswordEmail(resetToken, recipientEmail);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith(
				expect.objectContaining({
					to: recipientEmail,
					subject: 'Passwort-Zurücksetzung für CineHub',
					html: expect.stringContaining(resetToken)
				})
			);
		});
	});

	describe('sendCancelationConfirmation', () => {
		it('should send a cancelation confirmation email', async () => {
			const showID = 1;
			const recipientEmail = 'user@example.com';

			(db.select as jest.Mock).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue([
							{
								Showing: { date: '2023-06-01', time: '20:00' },
								Film: { title: 'Cancelled Movie' }
							}
						])
					})
				})
			});

			await emailService.sendCancelationConfirmation(showID, recipientEmail);

			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: '"CineHub Ticket Service" <test@example.com>',
				to: recipientEmail,
				subject: 'Stornierung der Vorstellung Cancelled Movie am 2023-06-01',
				html: expect.stringContaining(
					'wir bedauern Ihnen mitteilen zu müssen, dass die Vorstellung von Cancelled Movie am 2023-06-01 um 20:00 leider abgesagt werden muss.'
				)
			});
		});
		it('should send a discount code email', async () => {
			const discount: Discount = {
				id: 1,
				code: 'TEST10',
				value: '10',
				discountType: 'percentage',
				expiresAt: '2023-12-31', // Changed to string
				name: 'Test Discount'
			};

			await emailService.sendDiscountCode('user@example.com', discount);

			expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith(
				expect.objectContaining({
					to: 'user@example.com',
					subject: 'Ihr Rabattcode für CineHub',
					html: expect.stringContaining('TEST10')
				})
			);
		});

		it('should send a welcome email', async () => {
			await emailService.sendWelcomeEmail('newuser@example.com');

			expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith(
				expect.objectContaining({
					to: 'newuser@example.com',
					subject: 'Willkommen im CineHub',
					html: expect.stringContaining('Herzlich willkommen im CineHub!')
				})
			);
		});

		it('should send a newsletter', async () => {
			const emails = ['user1@example.com', 'user2@example.com'];
			const subject = 'Test Newsletter';
			const htmlContent = '<p>Test Content</p>';

			await emailService.sendNewsletter(emails, subject, htmlContent);

			expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(2);
			expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith(
				expect.objectContaining({
					to: 'user1@example.com',
					subject: 'Test Newsletter',
					html: expect.stringContaining('Test Content')
				})
			);
			expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith(
				expect.objectContaining({
					to: 'user2@example.com',
					subject: 'Test Newsletter',
					html: expect.stringContaining('Test Content')
				})
			);
		});
	});
});
