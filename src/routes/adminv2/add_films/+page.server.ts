import { film } from '$lib/server/db/schema';
import { year } from 'drizzle-orm/mysql-core';
import { db } from '$lib/server/db';
import { error, type Actions, type RequestEvent } from '@sveltejs/kit';

import * as table from '$lib/server/db/schema';

type Movie = {
    id: number;
    title: string;
    year: number;
    poster: string; 
};

type CompleteMovieInformation = { 
    Title:string, 
    Type:string, 
    Year: number, 
    Poster:string,
    Runtime:string, 
    Genre:string, 
    Director:string, 
    Plot:string, 
    Release:Date 
};

let movies:Movie[];
let completeMovieInformation:CompleteMovieInformation[];

export const actions = {
    
    search: async ({request}:RequestEvent) => {
        const formdata =  await request.formData();
        const query = formdata.get("query");

        if (!query) throw error(400,"Query is required");

        
        try {
            const res = await fetch(`http://www.omdbapi.com/?apikey=b97fe887&s=${query}`);
            const data = await res.json();
            console.log(data)
            movies  = data.Search.map((movie: any) =>({
                id: movie.imdbID,
                title: movie.Title,
                type: movie.Type,
                year: movie.Year,
                poster: movie.Poster
            }));
            // return{
            //     movies: films
            // }
        } catch(e:unknown){ 
            throw error(500, "searchError: " + e)   
        }
        
        

    },
    save: async ({request}) => {
       console.log("save")
       const formData =  await request.formData()
       const id = formData.get("id");
       console.log(id)

       try {
        const res = await fetch(`http://www.omdbapi.com/?apikey=b97fe887&plot=full&i=${id}`);

        if (!res.ok) {
            throw error(res.status, 'Failed to fetch data from external API');
        }

        const data = await res.json();
        completeMovieInformation = data.map((movie:CompleteMovieInformation) => ({
                title: movie.Title,
                type: movie.Type,
                year: movie.Year,
                poster: movie.Poster,
                runtime: movie.Runtime,
                genre: movie.Genre,
                director: movie.Director,
                description: movie.Plot,
                releaseDate: movie.Release 

        }));

        await db.insert(film).values(data)
       }catch(e){
        console.log("error" + e)
       }
    }
    
} satisfies Actions;




export const load = async (event) => {

    return{
        movies: movies
    }

  };
