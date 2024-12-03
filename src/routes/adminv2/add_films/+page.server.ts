import { film } from '$lib/server/db/schema';
import { year } from 'drizzle-orm/mysql-core';
import type { Actions } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';


let filmSearch:{id:string, title:string, type:string, year: number, poster:string}[];
let completeFilmInformation:{title:string, type:string, genre: string, director:string,runtime:string, ageRating:string, poster:string, description:string,releaseDate:string }[];



export const actions = {
    
    search: async ({request}) => {
        const formdata =  await request.formData();
        const query = formdata.get("query");

        if (!query) throw error(400,"Query is required");

        
        try {
            const res = await fetch(`http://www.omdbapi.com/?apikey=b97fe887&s=${query}`);
            const data = await res.json();
            console.log(data)
            filmSearch= data.Search.map((movie: { imdbID: string; Title: any; Type:any; Year:any; Poster:string }) =>({
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
    save: async ({request}) => {
       console.log("save")
       const formData =  await request.formData()
       const id = formData.get("id");
       console.log(id)

       try {
        const res = await fetch(`http://www.omdbapi.com/?apikey=b97fe887&plot=full&i=${id}`);
        const data = await res.json();
        console.log(data)
        completeFilmInformation = data.map((movie:{ Title:string, Type:string, Year: number, Poster:string,Runtime:string, Genre:string, Director:string, Plot:string, Release:Date } ) => ({

            
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
        // console.log(completeFilmInformation)
        await db.insert(film).values(data)


       }catch(e){
        console.log("error" + e)
       }
 

        
    }
    
} satisfies Actions;




export const load = async (event) => {
   
    return{
        movies: filmSearch
    }

  };
