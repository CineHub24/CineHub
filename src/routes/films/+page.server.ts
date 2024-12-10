import { db } from '$lib/server/db';
import { film } from '$lib/server/db/schema';
export const load = async (event) => {


    const movies = await db.select().from(film)

    return{
        movies: movies
    }

}

