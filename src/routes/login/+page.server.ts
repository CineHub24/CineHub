import { fail, redirect } from '@sveltejs/kit';
import { verify } from 'argon2';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { validatePassword, validateEmail } from '$lib/utils/user';
import { languageAwareRedirect } from '$lib/utils/languageAware';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return languageAwareRedirect(302, '/');
	}
	console.log('event', event);
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (!validateEmail(email)) {
			return fail(400, { message: 'Invalid email' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		const results = await db.select().from(table.user).where(eq(table.user.email, email));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		let validPassword: boolean;
		if (!existingUser.password) {
			validPassword = false;
		} else {
			validPassword = await verify(existingUser.password, password, {
				memoryCost: 19456,
				timeCost: 2,
				hashLength: 32,
				parallelism: 1
			});
		}
		if (!validPassword) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		console.log('session', session);
		console.log('sessionToken', sessionToken);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return languageAwareRedirect(302, '/');
	}
};
