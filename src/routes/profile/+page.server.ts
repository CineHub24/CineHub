import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
    // Fetch user information from locals
    if(!event.locals.user) {
		return languageAwareRedirect(301, '/login');
    }
    const user = event.locals.user;

    // Return data to the page
    return {
        user
    };
};

export const actions: Actions = {
    updateProfile: async (event) => {
        // Check if user is authenticated
        if (!event.locals.user || !event.locals.session) {
            return fail(401, { error: 'Unauthorized' });
        }

        try {
            // Get form data
            const formData = await event.request.formData();
            const firstName = formData.get('firstname')?.toString().trim();
            const lastName = formData.get('lastname')?.toString().trim();

            // Validate that at least one field is provided
            if (!firstName && !lastName) {
                return fail(400, { error: 'At least one field must be provided' });
            }

            // Update user in database
            await db
                .update(user)
                .set({
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName })
                })
                .where(eq(user.id, event.locals.user.id));

            // Return success
            return { success: true };

        } catch (error) {
            console.error('Error updating profile:', error);
            return fail(500, { error: 'Internal Server Error' });
        }
    },

    logout: async (event) => {
        // Check if a session exists
        if (!event.locals.session) {
            return fail(401, { error: 'Unauthorized' });
        }

        try {
            // Invalidate session
            await auth.invalidateSession(event.locals.session.id);
            auth.deleteSessionTokenCookie(event);
        } catch (error) {
            console.error('Error during logout:', error);
            return fail(500, { error: 'Internal Server Error' });
        }

        // Redirect to the homepage after logout
        throw languageAwareRedirect(303, '/');
    }
};