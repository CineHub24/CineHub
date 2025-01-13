import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import { type Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import deleteOldReservedTicketsJob from '$lib/utils/jobs/deleteTicketsJob';

deleteOldReservedTicketsJob();

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

const handleInspector: Handle = async ({ event, resolve }) => {

	const user = event.locals.user;
	if (user && (user.role === 'inspector' || user.role === 'admin')) {
		return resolve(event);
	} else {
		const message = new Response("Forbidden", {status: 403, statusText: "Forbidden - You are not an inspector"});
		console.log(message, user);
		return message;
	}
}

const handleParaglide: Handle = i18n.handle();

const handle: Handle = async ({ event, resolve }) => {

	if (event.url.pathname.startsWith('/api/seats/') && event.url.pathname.endsWith('/stream')) {
		// Set required headers for SSE
		const response = await resolve(event, {
			transformPageChunk: ({ html }) => html
		});

		// Ensure the connection stays alive
		response.headers.set('Connection', 'keep-alive');
		response.headers.set('Cache-Control', 'no-cache, no-transform');
		response.headers.set('Content-Type', 'text/event-stream');
		response.headers.set('X-Accel-Buffering', 'no');

		return response;
	}

	if (event.url.pathname.startsWith('/admin')) {
		return sequence(handleAuth, handleAdmin, handleParaglide)({ event, resolve });
	}
	if (event.url.pathname.startsWith('/validation')) {
		return sequence(handleAuth, handleInspector, handleParaglide)({ event, resolve });
	}
	return sequence(handleAuth, handleParaglide)({ event, resolve });
};


export { handle };
