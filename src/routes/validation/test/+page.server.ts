import { EmailService } from '$lib/utils/emailService';
import { generateQRCodeBase64 } from '$lib/utils/generateQR';

export const load = async ({}) => {
	const qrCode = await generateQRCodeBase64('1234');
	const gmailUser = import.meta.env.VITE_GMAIL_USER;
	const gmailAppPassword = import.meta.env.VITE_GMAIL_APP_PASSWORD;
	const emailClient = new EmailService(gmailUser, gmailAppPassword);
    console.log(gmailAppPassword, gmailUser)

	const ticket = {
		movieTitle: 'Inception',
		date: '2021-12-24',
		time: '20:00',
		hall: 'Saal 1',
		seat: 'A1',
		id: '1234'
	};
	console.log('sending email');
	// try {
	// 	await emailClient.sendTicketConfirmation(ticket, 'felixb.erhard@gmail.com');
	// 	console.log('email sent');
	// } catch (error) {
	// 	console.log(error);
	// }

	return {
		code: qrCode
	};
};
