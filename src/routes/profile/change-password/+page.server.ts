import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';
import { validatePassword } from '$lib/utils/user.js';
import { hash, verify } from 'argon2';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return languageAwareRedirect(301, '/login');
	}

	// Get user data to check if password exists
	const users = await db.select().from(user).where(eq(user.id, event.locals.user.id));
	const hasNoPassword = users[0]?.password == null || users[0]?.password == '';

	return {
		user: event.locals.user,
		hasNoPassword
	};
};

export const actions: Actions = {
	changePassword: async (event) => {
		if (!event.locals.user || !event.locals.session) {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const formData = await event.request.formData();
			const currentPassword = formData.get('currentPassword')?.toString();
			const newPassword = formData.get('newPassword')?.toString();
			const confirmPassword = formData.get('confirmPassword')?.toString();

			// Get user data to check if password exists
			const users = await db.select().from(user).where(eq(user.id, event.locals.user.id));
			console.log('Current PW: ' + users[0]?.password + '#');
			const hasNoExistingPassword = users[0]?.password == null || users[0]?.password == '';

			// Validate inputs
			if ((!currentPassword && !hasNoExistingPassword) || !newPassword || !confirmPassword) {
				return fail(400, {
					error: 'Alle Felder müssen ausgefüllt werden',
					missing: true
				});
			}

			if (newPassword !== confirmPassword) {
				return fail(400, {
					error: 'Die neuen Passwörter stimmen nicht überein',
					mismatch: true
				});
			}

			if (!validatePassword(newPassword)) {
				return fail(400, {
					error:
						'Das neue Passwort muss Groß- & Kleinbuchstaben, Zahlen sowie Sonderzeichen enthalten und zwischen 8 und 255 Zeichen lang sein.',
					invalid: true
				});
			}

			// Only verify current password if user has one
			if (!hasNoExistingPassword) {
				if (!users[0]?.password) {
					return fail(400, { error: 'Benutzer nicht gefunden' });
				}

				const isValidPassword = await verify(users[0].password, <string | Buffer>currentPassword);
				if (!isValidPassword) {
					return fail(400, {
						error: 'Das aktuelle Passwort ist nicht korrekt',
						invalidCurrent: true
					});
				}
			}

			// Hash and save new password
			const passwordHash = await hash(newPassword, {
				memoryCost: 19456,
				timeCost: 2,
				hashLength: 32,
				parallelism: 1
			});

			await db
				.update(user)
				.set({ password: passwordHash })
				.where(eq(user.id, event.locals.user.id));
		} catch (error) {
			console.error('Error changing password:', error);
			return fail(500, { error: 'Internal Server Error' });
		}

		return languageAwareRedirect(303, '/profile?passwordChanged=true');
	}
};
