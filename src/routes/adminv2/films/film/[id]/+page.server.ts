import { db } from '$lib/server/db';
import { film } from '$lib/server/db/schema';
import type { Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';
export const load = async ({url}) => {

    console.log(url.pathname)
    let id = <unknown>url.pathname.replace("/adminv2/films/film/", "")
    console.log(id)
    const movies = await db.select().from(film).where(eq(film.id,<number>id))

    return{
        filme: movies
    }

}
export const actions = {
    
    update: async ({request}) =>{

        const formData = await request.formData()
        const updatedData = formData.getAll("update");
        console.log(updatedData)


    }
    
} satisfies Actions;
    