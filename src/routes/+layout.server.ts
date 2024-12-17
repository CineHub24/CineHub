import type { Actions, PageServerLoad } from './$types';


export const load: PageServerLoad = async (event: { locals: { user: any; }; }) => {
    return { user: event.locals.user };
};

