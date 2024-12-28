import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { languageAwareRedirect } from '$lib/utils/languageAware';

export const load: PageServerLoad = async (event) => {
    // Fetch user information from locals
    if(!event.locals.user) {
        return fail(401, { message: 'Unauthorized' });
    }
    const user = event.locals.user;

    // Return data to the page
    return {
        user
    };
};

export const actions: Actions = {
    logout: async (event) => {
        // Check if a session exists
        if (!event.locals.session) {
            return fail(401, { message: 'Unauthorized' });
        }

        try {
            // Invalidate session
            await auth.invalidateSession(event.locals.session.id);
            auth.deleteSessionTokenCookie(event);
        } catch (error) {
            console.error('Error during logout:', error);
            return fail(500, { message: 'Internal Server Error' });
        }

        // Redirect to the homepage after logout
        throw languageAwareRedirect(303, '/');
    }
};
