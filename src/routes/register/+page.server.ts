import { hash } from 'argon2';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { generateUserId } from '$lib/utils/user';
import { validateEmail, validatePassword } from '$lib/utils/user';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { EmailService } from '$lib/utils/emailService';

export const load: PageServerLoad = async (event) => {
	return {};
};

export const actions: Actions = {
	register: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (!validateEmail(email)) {
			return fail(400, { message: 'Invalid email' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		const userId = generateUserId();
		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			hashLength: 32,
			parallelism: 1
		});

		try {
			await db.insert(table.user).values({ id: userId, email, password: passwordHash });
			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			return fail(500, { message: 'An error has occurred ' + e });
		}
		try {
			const gmailUser = import.meta.env.VITE_GMAIL_USER;
			const gmailAppPassword = import.meta.env.VITE_GMAIL_APP_PASSWORD;
			const emailClient = new EmailService(gmailUser, gmailAppPassword);
			await emailClient.sendWelcomeEmail(email as string);
		} catch (error) {
			return fail(500, { message: 'Failed to send welcome email' });
		}
		return languageAwareRedirect(302, '/');
	}
};
