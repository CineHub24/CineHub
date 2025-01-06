import { film } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { error, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { fail } from '@sveltejs/kit';

export type Movie = typeof film.$inferSelect;
const apiKey = import.meta.env.VITE_OMDB_API_KEY;
const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;

export type CompleteMovieInformation = {
	imdbID: string;
	title: string;
	year: number;
	poster: string;
	runtime: number;
	genre: string[];
	ageRating: string;
	director: string;
	description: string;
};

type filmForInsert = typeof film.$inferInsert;

export const actions = {
	search: async ({ request }: RequestEvent) => {
		const formdata = await request.formData();
		const query = formdata.get('query');

		if (!query) return { movies: [] };

		try {
			const res = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${query}`);
			const data = await res.json();
			console.log(data);
			if(data.Response !== 'False') {
				const movies: Movie[] = data.Search.map((movie: any) => ({
					imdbID: movie.imdbID,
					title: movie.Title,
					type: movie.Type,
					year: movie.Year,
					poster: movie.Poster
				}));
	
				return {
					movies: movies
				};
			}
		} catch (e: unknown) {
			return fail(500, { error: 'Failed to search for movies' });
		}
	},

	fetchFullMovieDetails: async ({ request }) => {
		const data = await request.formData();
		const movieId = data.get('id');

		try {
			// Fetch full movie details from OMDB API
			const response = await fetch(`http://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`);
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
			};

			//genres -> extre tabellen?
			return {
				type: 'success',
				data: {
					movie: JSON.stringify(movieResponse)
				}
			};
		} catch (error) {
			console.error('Error fetching movie details:', error);
			return fail(500, { error: 'Failed to fetch movie details' });
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

		async function gettmdbID(imdbID: string): Promise<string | null> {
			try {
				const response = await fetch(
					`https://api.themoviedb.org/3/find/${imdbID}?api_key=${tmdbApiKey}&external_source=imdb_id`
				);
				const data = await response.json();
				if (data.movie_results && data.movie_results.length > 0) {
					return data.movie_results[0].id.toString();
				}
			} catch (error) {
				console.error('Error fetching TMDB ID:', error);
			}
			return null;
		}

		const imdbID = formData.get('imdbID')?.toString();
		if (!imdbID) return fail(400, { error: 'IMDB ID is required' });	
		const tmdbID = await gettmdbID(imdbID);

		async function getBackdropImage(tmdbID: string): Promise<string | null> {
			try {
				const response = await fetch(
					`https://api.themoviedb.org/3/movie/${tmdbID}/images?api_key=${tmdbApiKey}`
				);
				const data = await response.json();
				if (data.backdrops && data.backdrops.length > 0) {
					return `https://image.tmdb.org/t/p/original/${data.backdrops[0].file_path}`;
				}
			} catch (error) {
				console.error('Error fetching backdrop image:', error);		
			}
			return null;
		}

		const backdrop = tmdbID ? await getBackdropImage(tmdbID) : null;

		const movieToSave: filmForInsert = {
			imdbID: imdbID,
			tmdbID: tmdbID,
			backdrop: backdrop,
			title: formData.get('title')?.toString(),
			genres: formData
				.get('genres')
				?.toString()
				.split(',')
				.map((e) => e.trim()),
			director: formData.get('director')?.toString(),
			runtime: extractNumberFromRuntime(formData.get('runtime')?.toString()),
			ageRating: formData.get('actors')?.toString(),
			poster: formData.get('poster')?.toString(),
			description: formData.get('plot')?.toString(),
			year: formData.get('year')?.toString()
		};

		let success = false;
		let filmId: number;

		try {
			if (!movieToSave.imdbID || !movieToSave.title) {
				// Maybe add more
				return fail(400, { error: 'IMDB ID and title are required' });
			}

			[{ filmId }] = await db.insert(film).values(movieToSave).returning({ filmId: film.id });

			console.log(filmId);

			success = true;
		} catch (e) {
			console.error('Error saving movie:', e);
			return fail(500, { error: 'Failed to save movie' });
		}
		if (success) throw languageAwareRedirect(302, `/admin/film/${filmId}`);
	}
} satisfies Actions;
