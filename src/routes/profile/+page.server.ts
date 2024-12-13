import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    // Fetch user information from locals
    const user = event.locals.user || { email: 'guest@example.com', role: 'Guest', id: 0 };

    // Return data to the page
    return {
        user,
        m: {
            hello_world: ({ name }: { name: string }) => `Hello, ${name}!`
        }
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
        throw redirect(303, '/');
    }
};
