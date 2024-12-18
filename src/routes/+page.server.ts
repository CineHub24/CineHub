import { db } from '$lib/server/db';
import { film, showing } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Automatische Weiterleitung auf die Loginseite entfernt: Man soll die Website ja auch ohne Anmeldung nutzen können (Jonathan)
	const movies = await db
            .select()
            .from(film)
    return {
		movies: movies
    };
};