import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    // Automatische Weiterleitung auf die Loginseite entfernt: Man soll die Website ja auch ohne Anmeldung nutzen können (Jonathan)
    return {
        user: event.locals.user || { email: 'guest@example.com', role: 'Guest', id: 0 },
    };
};


export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);
	}
};