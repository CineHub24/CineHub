import { film } from '$lib/server/db/schema';
import { year } from 'drizzle-orm/mysql-core';
import type { Actions } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';


let films:{id:number, title:string, type:string, year: number, poster:string}[];

export const actions = {
    
    search: async ({request}) => {
        const formdata =  await request.formData();
        const query = formdata.get("query");

        if (!query) throw error(400,"Query is required");

        
        try {
            const res = await fetch(`http://www.omdbapi.com/?apikey=b97fe887&s=${query}`);
            const data = await res.json();
            console.log(data)
            films = data.Search.map((movie: { imdbID: any; Title: any; Type:any; Year:any; Poster:string }) =>({
                id: movie.imdbID,
                title: movie.Title,
                type: movie.Type,
                year: movie.Year,
                poster: movie.Poster
            }));
            // return{
            //     movies: films
            // }
        } catch(e) {
            throw error(500, "API")
        }
        
        

    },
    save: async ({}) => {
       console.log("save")


        
    }
    
} satisfies Actions;




export const load = async (event) => {
   
    return{
        movies: films
    }

  };
