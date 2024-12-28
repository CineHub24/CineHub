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

	const split = event.url.pathname.split('/');
	if (split.includes('logout')) {
		if (!event.locals.session) {
			return new Response('Unauthorized', { status: 401 });
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);
		return languageAwareRedirect(302, '/login');
	}

	return resolve(event);
};

const handleAdmin: Handle = async ({ event, resolve }) => {
	const user = event.locals.user;
	if (user && user.role === 'admin') {
		return resolve(event);
	} else {
		const message = new Response("Forbidden", {status: 403, statusText: "Forbidden - You are not an admin"});
		console.log(message, user);
		return message;
	}
};

const handleParaglide: Handle = i18n.handle();

const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/admin')) {
		return sequence(handleAuth, handleAdmin, handleParaglide)({ event, resolve });
	}
	return sequence(handleAuth, handleParaglide)({ event, resolve });
};

export { handle };
