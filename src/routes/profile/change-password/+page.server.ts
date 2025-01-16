import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';
import { validatePassword } from '$lib/utils/user.js';
import { hash, verify } from 'argon2';

export const load: PageServerLoad = async (event) => {
    // Check if user is authenticated
    if (!event.locals.user) {
        return languageAwareRedirect(301, '/login');
    }

    return {
        user: event.locals.user
    };
};

export const actions: Actions = {
    changePassword: async (event) => {
        // Check if user is authenticated
        if (!event.locals.user || !event.locals.session) {
            return fail(401, { error: 'Unauthorized' });
        }

        try {
            const formData = await event.request.formData();
            const currentPassword = formData.get('currentPassword')?.toString();
            const newPassword = formData.get('newPassword')?.toString();
            const confirmPassword = formData.get('confirmPassword')?.toString();

            // Validate inputs
            if (!currentPassword || !newPassword || !confirmPassword) {
                return fail(400, { 
                    error: 'Alle Felder müssen ausgefüllt werden',
                    missing: true
                });
            }

            // Check if new passwords match
            if (newPassword !== confirmPassword) {
                return fail(400, {
                    error: 'Die neuen Passwörter stimmen nicht überein',
                    mismatch: true
                });
            }

            // Validate password requirements
            if (!validatePassword(newPassword)) {
                return fail(400, {
                    error: 'Das neue Passwort muss Groß- & Kleinbuchstaben, Zahlen sowie Sonderzeichen enthalten und zwischen 8 und 255 Zeichen lang sein.',
                    invalid: true
                });
            }

            // Get user from database to verify current password
            const users = await db.select().from(user).where(eq(user.id, event.locals.user.id));

            if (users.length != 1) {
                return fail(400, { error: 'User not found'} );
            }

            const userData = users[0];

            if (!userData?.password) {
                return fail(400, { error: 'Benutzer nicht gefunden' });
            }

            // Verify current password
            const isValidPassword = await verify(userData.password, currentPassword);
            if (!isValidPassword) {
                return fail(400, {
                    error: 'Das aktuelle Passwort ist nicht korrekt',
                    invalidCurrent: true
                });
            }

            // Hash new password with same parameters as reset
            const passwordHash = await hash(newPassword, {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1
            });

            // Update password in database
            await db
                .update(user)
                .set({ password: passwordHash })
                .where(eq(user.id, event.locals.user.id));
        } catch (error) {
            console.error('Error changing password:', error);
            return fail(500, { error: 'Internal Server Error' });
        }

        // Redirect to profile page with success message
        return languageAwareRedirect(303, '/profile?passwordChanged=true');
    }
};