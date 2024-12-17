import type { Actions, PageServerLoad } from './$types';


export const load: PageServerLoad = async (event) => {
    return { user: event.locals.user };
};

