import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import { type Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import { languageAwareRedirect } from '$lib/utils/languageAware';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	if (event.url.pathname === '/logout') {
		if (!event.locals.session) {
			return new Response('Unauthorized', { status: 401 });
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);
		return languageAwareRedirect(302, '/login');
	}

	return resolve(event);
};

const handleParaglide: Handle = i18n.handle();
export const handle: Handle = sequence(handleAuth, handleParaglide);
