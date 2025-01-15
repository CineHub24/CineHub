import { db } from '$lib/server/db';
import { booking, giftCodesUsed, priceDiscount, ticket } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { EmailService } from '$lib/utils/emailService';
import { json, type RequestHandler } from '@sveltejs/kit';
import { languageAwareGoto, languageAwareRedirect } from '$lib/utils/languageAware';

const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Sandbox URL
const PAYPAL_CLIENT_ID = import.meta.env.VITE_CLIENT_ID_PAYPAL;
const PAYPAL_CLIENT_SECRET = import.meta.env.VITE_SECRET_PAYPAL;
// console.log(PAYPAL_CLIENT_ID);
// console.log(PAYPAL_CLIENT_SECRET);

async function getAccessToken() {
	const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
		method: 'POST',
		body: 'grant_type=client_credentials',
		headers: {
			Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`
		}
	});
	const data = await response.json();
	// console.log(data);
	return data.access_token;
}

async function verifyPayPalPayment(orderId: string, accessToken: string) {
	const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	});
	return await response.json();
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { orderId } = await request.json();
	
	const accessToken = await getAccessToken();
	
	const response = await verifyPayPalPayment(orderId, accessToken);

    if(response.status !== 'COMPLETED') {
        languageAwareGoto('/cart');
    }
	const bookingId = response.purchase_units[0].reference_id;
	try {
		const gmailUser = import.meta.env.VITE_GMAIL_USER;
		const gmailAppPassword = import.meta.env.VITE_GMAIL_APP_PASSWORD;
		const emailClient = new EmailService(gmailUser, gmailAppPassword);

		const tickets = await db
			.update(ticket)
			.set({ status: 'paid' })
			.where(eq(ticket.bookingId, Number(bookingId))).returning();
			const bookings = await db.update(booking).set({ status: 'completed' }).where(eq(booking.id, Number(bookingId))).returning();
		await emailClient.sendBookingConfirmation(Number(bookingId), locals.user.email as string);

		return json({ success: true });
	} catch (e) {
		console.error(e);
		return new Response('Internal Server Error', { status: 500 });
	}
};
