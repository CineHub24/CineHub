import { password } from '$lib/paraglide/messages.js';
import { db } from '$lib/server/db';
import { passwordReset, user } from '$lib/server/db/schema.js';
import { eq, and, gte } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { EmailService } from '$lib/utils/emailService.js';
import { validatePassword } from '$lib/utils/user.js';
import { hash } from 'argon2';
import { LogLevel, logToDB } from '$lib/utils/dbLogger';
import * as m from '$lib/paraglide/messages.js';

export const load = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (token) {
		// Wenn ein Token vorhanden ist, leiten Sie zu einer anderen Seite weiter
		// oder geben Sie einen Statuswert zurück

		return { hasToken: true, token: token }; // Beispiel für eine Weiterleitung
	}

	// Wenn kein Token vorhanden ist, laden Sie die normale Seite
	return { hasToken: false };
};

export const actions = {
	resetPassword: async ({ request }) => {
		const gmailUser = import.meta.env.VITE_GMAIL_USER;
		const gmailAppPassword = import.meta.env.VITE_GMAIL_APP_PASSWORD;
		const emailClient = new EmailService(gmailUser, gmailAppPassword);

		const formData = await request.formData();
		const email = formData.get('email') as unknown as string;
		try {
			const selectedUser = await db.select().from(user).where(eq(user.email, email));
			if (selectedUser.length === 0) {
				return {
					success: `Email was sent to Email: ${email}`
				};
			}
			const resetEntry = await db
				.insert(passwordReset)
				.values({ userId: selectedUser[0].id, expiresAt: new Date(Date.now() + 15 * 60 * 1000) })
				.returning();
			try {
				emailClient.sendResetPasswordEmail(resetEntry[0].token as string, email);
			} catch (error) {
				return fail(500, { error: 'Error while sending email' });
			}
			return { success: `Email was sent to Email: ${email}` };
		} catch (error) {
			return fail(500, { error: 'Error while reseting password' });
		}
	},
	setNewPassword: async (event) => {
		const request = event.request;
		const formData = await request.formData();
		const token = formData.get('token') as unknown as string;
		const password = formData.get('password') as unknown as string;
		const confirmPassword = formData.get('confirmPassword') as unknown as string;
		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match' });
		}
		if (!validatePassword(password)) {
			return fail(400, { error: m.password_requirements({}) });
		}
		// Min 8 chars	
		// Max 255 chars
		// Upper- and lower-case
		// Includes numbers
		// Includes special characters
		try {
			const userToChange = await db
				.select()
				.from(passwordReset)
				.where(
					and(eq(passwordReset.token, token as string), gte(passwordReset.expiresAt, new Date()))
				);
			console.log(userToChange);
			if (userToChange.length === 0) {
				return fail(400, { error: 'Invalid token' });
			}
			const passwordHash = await hash(password, {
				// recommended minimum parameters
				memoryCost: 19456,
				timeCost: 2,
				hashLength: 32,
				parallelism: 1
			});
			await db
				.update(user)
				.set({ password: passwordHash })
				.where(eq(user.id, userToChange[0].userId as string));
			await db.delete(passwordReset).where(eq(passwordReset.token, token as string));
			await logToDB(
				LogLevel.INFO,
				"Changed password for user with id " + userToChange[0].userId,	
				event
			);
			return { success: 'Password has been changed' };
		} catch (error) {
			console.log(error);
			return fail(500, { error: 'Error while setting new password' });
		}
	}
};
