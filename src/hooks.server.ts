import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import { redirect, type Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import { goto } from '$app/navigation';
import Header from '$lib/components/header.svelte';

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

	return resolve(event);
};

const handleAdmin: Handle = async ({ event, resolve }) => {
	const user = event.locals.user;
	if (user && user.role === 'admin') {
		return resolve(event);
	} else {
		return redirect(302, '/');
		
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
