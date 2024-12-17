import type { PageLoad } from './$types';

interface Trailer {
    id: string;
    key: string;
    name: string;
    site: 'YouTube' | 'Vimeo';
}

export const load: PageLoad = async ({ params, fetch, data }) => {
    const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const movieId = Number(data.movie.imdbID); // Verwenden der TMDB-ID aus Ihrer Datenbankabfrage

    // Trailer-Fetching-Funktion
    const fetchTrailers = async (id: number): Promise<Trailer[]> => {
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=de-DE`
            );
            
            if (!response.ok) {
                throw new Error('Trailer konnten nicht geladen werden');
            }
            
            const data = await response.json();
            
            return data.results
                .filter((video: any) => 
                    video.site === 'YouTube' && 
                    (video.type === 'Trailer' || video.type === 'Teaser')
                )
                .map((video: any) => ({
                    id: video.id,
                    key: video.key,
                    name: video.name,
                    site: video.site
                }))
                .slice(0, 1); // Nur den ersten Trailer
        } catch (error) {
            console.error('Fehler beim Laden der Trailer:', error);
            return [];
        }
    };

    // Nur Trailer laden, wenn eine TMDB-ID vorhanden ist
    const trailers = movieId ? await fetchTrailers(movieId) : [];

    return {
        trailers
    };
};