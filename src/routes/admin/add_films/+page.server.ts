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
    runtime: number;
    genre: string[];
    ageRating: string,
    director: string;
    description: string;
};

type filmForInsert = typeof film.$inferInsert;


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

        function extractNumberFromRuntime(runtime: string | null | undefined): number | null {
            if (!runtime) return null;

            // Use a regex to extract the first number from the string
            const match = runtime.match(/\d+/);
            return match ? Number(match[0]) : null;
        }

        const movieToSave: filmForInsert = {
            imdbID: formData.get("imdbID")?.toString(),
            title: formData.get("title")?.toString(),
            genres: formData.get("genres")?.toString().split(',').map(e => e.trim()), 
            director: formData.get("director")?.toString(),
            runtime: extractNumberFromRuntime(formData.get("runtime")?.toString()),
            ageRating: formData.get("actors")?.toString(),
            poster: formData.get("poster")?.toString(),
            description: formData.get("plot")?.toString(),
            year: formData.get("year")?.toString()
        };

        let success = false;
        let filmId: number;

        try {
            if (!movieToSave.imdbID || !movieToSave.title) {    // Maybe add more
                throw error(400, 'Missing required movie information');
            }

            [{ filmId }] = await db.insert(film).values(movieToSave).returning({ filmId: film.id });;

            console.log(filmId)

            success = true;

        } catch (e) {
            console.error("Error saving movie:", e);
            throw error(500, 'Failed to save movie');
        }
        if (success) throw redirect(302, `/admin/films/film/${filmId}`);
    }
} satisfies Actions;


