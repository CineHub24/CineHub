import { error, json, type RequestEvent } from '@sveltejs/kit';

type TMDBFilm = {
    id: number;
    title: string;
    genre_ids: number[];
    poster_path: string | null; // Images may not always be available
};

export const GET = async ({ url }: RequestEvent) => {
    const query = url.searchParams.get('query');

    if (!query) {
        throw error(400, 'Query parameter is required');
    }

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=779d746d2e9260a3e32aa53ef8555c79&query=${encodeURIComponent(
                query
            )}`
        );

        if (!response.ok) {
            throw error(response.status, 'Failed to fetch data from external API');
        }

        const data = await response.json();

        // Base URL for TMDb images
        const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';
        const IMAGE_SIZE = 'w500'; // Example size (can be adjusted)

        return json({
            results: data.results.map((film: TMDBFilm) => ({
                id: film.id,
                title: film.title,
                genre: film.genre_ids?.join(', ') || 'Unknown', // Simplified
                director: 'Unknown', // TMDb doesn't return directors in search
                poster: film.poster_path
                    ? `${TMDB_IMAGE_BASE}${IMAGE_SIZE}${film.poster_path}`
                    : null, // Full image path or null if no poster
            })),
        });
    } catch (err) {
        console.error(err);
        throw error(500, 'Failed to fetch films from external API');
    }
};
