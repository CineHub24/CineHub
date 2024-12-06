import { film } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { error, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';
import type { year } from 'drizzle-orm/mysql-core';


export type Movie = {
    imdbID: string; // IMDb ID
    title: string;
    year: number;
    poster: string;
};

export type CompleteMovieInformation = {
    imdbID: string;
    title: string;
    year: number;
    poster: string;
    runtime: string;
    genre: string[];
    ageRating: string,
    director: string;
    description: string;
};


export const actions = {
    
    search: async ({request}:RequestEvent) => {
        const formdata =  await request.formData();
        const query = formdata.get("query");

        if (!query) throw error(400,"Query is required");

        
        try {
            const res = await fetch(`http://www.omdbapi.com/?apikey=b97fe887&s=${query}`);
            const data = await res.json();
            console.log(data)
            const movies: Movie[] = data.Search.map((movie: any) => ({
                imdbID: movie.imdbID,
                title: movie.Title,
                type: movie.Type,
                releaseDate: movie.ReleaseDate,
                poster: movie.Poster
            }));

            return {
                movies: movies
            }

        } catch(e:unknown){ 
            throw error(500, "searchError: " + e)   
        }
    },

    fetchFullMovieDetails: async ({ request }) => {
        const data = await request.formData();
        const movieId = data.get('id');

        try {
            // Fetch full movie details from OMDB API
            const response = await fetch(`http://www.omdbapi.com/?i=${movieId}&apikey=b97fe887&`);
            const fullMovieDetails = await response.json();

            const movieResponse: CompleteMovieInformation = {
                imdbID: fullMovieDetails.imdbID,
                title: fullMovieDetails.Title,
                poster: fullMovieDetails.Poster,
                genre: fullMovieDetails.Genre,
                director: fullMovieDetails.Director,
                runtime: fullMovieDetails.Runtime,
                ageRating: fullMovieDetails.Rated,
                description: fullMovieDetails.Plot,
                year: fullMovieDetails.Year
            }

            //genres -> extre tabellen?
            return {
                type: 'success',
                data: {
                    movie: JSON.stringify(movieResponse),
                }
            };
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return {
                type: 'failure',
                error: 'Could not fetch movie details'
            };
        }
    },
    save: async ({ request }) => {
        const formData = await request.formData();

        const movieToSave = {
            imdbID: formData.get("imdbID")?.toString(),
            title: formData.get("title")?.toString(),
            genre: formData.get("genre")?.toString(),
            director: formData.get("director")?.toString(),
            runtime: formData.get("runtime")?.toString(),
            ageRating: formData.get("actors")?.toString(),
            poster: formData.get("poster")?.toString(),
            description: formData.get("plot")?.toString(),
            year: formData.get("year")?.toString()
        };

        try {
            // Validate required fields
            if (!movieToSave.imdbID || !movieToSave.title) {
                throw error(400, 'Missing required movie information');
            }

            // Insert the movie into the database
            await db.insert(film).values(movieToSave);

            redirect(200, "/");

        } catch (e) {
            console.error("Error saving movie:", e);
            throw error(500, 'Failed to save movie');
        }
    }
} satisfies Actions;


