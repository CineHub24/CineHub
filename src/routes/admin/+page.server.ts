import { redirect, type Actions } from "@sveltejs/kit";
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { PageServerLoad } from "./$types";



export const actions: Actions = {
	loadFilms: async (event) => {
		let films;
        try {
           films= await db.select().from(table.film);
        } catch (error) {
            return redirect(302, '/admin');
        }
        return films;

		
	}
	};

    

    export const load: PageServerLoad = async ({ params }) => {
        return {
            films: await db.select().from(table.film), 
        }
        
    };