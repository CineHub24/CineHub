import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { subscribersNewsletter } from '$lib/server/db/schema';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email } = await request.json();

		if (!email) {
			return json({ error: 'Keine E-Mail angegeben!' }, { status: 400 });
		}

		//Hier die Logik zum Speichern der E-Mail (z.B. in einer Datenbank)
		console.log('Neue Newsletter-Anmeldung:', email);

		await db.insert(subscribersNewsletter).values({ email });

		return json({ message: 'Erfolgreich angemeldet!' });
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === '23505') {
			return json({ error: 'E-Mail bereits angemeldet!' }, { status: 400 });
		}
		console.error('Fehler beim Anmelden:', error);
		return json({ error: 'Fehler beim Verarbeiten der Anfrage.' }, { status: 500 });
	}
};
