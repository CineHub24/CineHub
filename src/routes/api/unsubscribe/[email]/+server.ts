// src/routes/api/unsubscribe/[email]/+server.ts
import { db } from '$lib/server/db';
import { subscribersNewsletter } from '$lib/server/db/schema';
import { LogLevel, logToDB } from '$lib/utils/dbLogger';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function GET(event) {
	const params = event.params;
	try {
		const email = decodeURIComponent(params.email);

		// Remove subscriber from the database
		await db.delete(subscribersNewsletter).where(eq(subscribersNewsletter.email, email));
		await logToDB(
			LogLevel.INFO,
			'Unsubscribed newsletter with email ' + email,
			event
		);

		// Redirect to a confirmation page
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/newsletter/unsubscribed'
			}
		});
	} catch (error) {
		console.error('Fehler beim Abmelden vom Newsletter:', error);
		return json({ error: 'Abmeldung fehlgeschlagen' }, { status: 500 });
	}
}
