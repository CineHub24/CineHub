import { db } from '$lib/server/db/index.js';
import { ticket } from '$lib/server/db/schema.js';
import { EmailService } from '$lib/utils/emailService';
import { generateQRCodeBase64 } from '$lib/utils/generateQR';

export const load = async ({}) => {
	const qrCode = await generateQRCodeBase64('1234');
	const gmailUser = import.meta.env.VITE_GMAIL_USER;
	const gmailAppPassword = import.meta.env.VITE_GMAIL_APP_PASSWORD;
	const emailClient = new EmailService(gmailUser, gmailAppPassword);
    

	// console.log('sending email');
    // const tickets = await db.select().from(ticket);
	// try {
	// 	await emailClient.sendBookingConfirmation(tickets[0].bookingId as number, 'felixb.erhard@gmail.com');
	// 	console.log('email sent');
	// } catch (error) {
	// 	console.log(error);
	// }

	return {
		code: qrCode
	};
};
