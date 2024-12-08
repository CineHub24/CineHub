import { db } from '$lib/server/db';
import { film, showing } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';

export const load = async ({ url }) => {
	let id = <unknown>url.pathname.replace('/film/', '');
    const movieId = Number(id);
    try{
        const movie = await db
            .select()
            .from(film)
            .where(eq(film.id, <number>id));
        const shows  = await db
            .select()
            .from(showing)
            .where(eq(showing.filmid, <number>id))
        
        return {
            movie: movie[0],
            shows: shows
        };
    }
    catch(e){
        console.log(e);
        throw error(500, "Internal Server Error DB");
    }
};