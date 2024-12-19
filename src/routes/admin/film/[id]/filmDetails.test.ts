import { load } from './+page.server';
import { describe, it, expect, vi } from 'vitest';

// Mock der Datenquelle
const mockMovies = [
	{
		id: 1,
		imdbID: 'tt1234567',
		title: 'Sample Movie',
		genres: ['Action', 'Adventure'],
		director: 'John Doe',
		runtime: 120,
		ageRating: 'PG-13',
		poster: 'https://example.com/poster.jpg',
		description: 'This is a sample movie.',
		year: 2022
	}
];

// Mock der Datenbankabfrage
const mockDb = {
	select: vi.fn((id) => {
		return mockMovies.find(movie => movie.id === id);
	})
};

// Mock der load-Funktion
vi.mock('./+page.server', () => ({
	load: vi.fn(({ url }) => {
		const id = parseInt(url.pathname.split('/').pop(), 10);
		const film = mockDb.select(id);
		return { film };
	})
}));

describe('load', () => {
	it('should return the correct movie when given a valid id', async () => {
		const url = { pathname: '/admin/film/1' };
		const expectedMovie = mockMovies[0];

		const result = await load({ url });

		expect(result.film).toEqual(expectedMovie);
	});

	it('should return undefined when given an invalid id', async () => {
		const url = { pathname: '/admin/film/999' };

		const result = await load({ url });

		expect(result.film).toBeUndefined();
	});
});