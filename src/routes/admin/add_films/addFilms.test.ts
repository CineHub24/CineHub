import { describe, expect, it } from "vitest";
import type { CompleteMovieInformation } from "./+page.server";

describe('CompleteMovieInformation', () => {
    it('should have the correct properties', () => {
        const movie: CompleteMovieInformation = {
            imdbID: 'tt1234567',
            title: 'Sample Movie',
            year: 2022,
            poster: 'https://example.com/poster.jpg',
            runtime: 120,
            genre: ['Action', 'Adventure'],
            ageRating: 'PG-13',
            director: 'John Doe',
            description: 'This is a sample movie.',
        };

        expect(movie.imdbID).toBe('tt1234567');
        expect(movie.title).toBe('Sample Movie');
        expect(movie.year).toBe(2022);
        expect(movie.poster).toBe('https://example.com/poster.jpg');
        expect(movie.runtime).toBe(120);
        expect(movie.genre).toEqual(['Action', 'Adventure']);
        expect(movie.ageRating).toBe('PG-13');
        expect(movie.director).toBe('John Doe');
        expect(movie.description).toBe('This is a sample movie.');
    });
});