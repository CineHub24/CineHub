import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';
import { db } from '$lib/server/db';
import { film } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import * as languageAwareModule from '$lib/utils/languageAware';

vi.mock('$lib/server/db', () => ({
	db: {
		insert: vi.fn(() => ({
			values: vi.fn(() => ({
				returning: vi.fn()
			}))
		}))
	}
}));

vi.mock('$lib/utils/languageAware', () => ({
	languageAwareRedirect: vi.fn()
}));

global.fetch = vi.fn();

describe('actions', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('search action', () => {
		it('should return empty array if no query', async () => {
			const mockRequest = {
				formData: () => Promise.resolve(new FormData())
			} as Request;

			const result = await actions.search({ request: mockRequest } as any);
			expect(result).toEqual({ movies: [] });
		});

		it('should return movies if search is successful', async () => {
			const mockRequest = {
				formData: () => {
					const formData = new FormData();
					formData.append('query', 'test');
					return Promise.resolve(formData);
				}
			} as Request;

			const mockResponse = {
				json: () =>
					Promise.resolve({
						Response: 'True',
						Search: [
							{
								imdbID: '123',
								Title: 'Test Movie',
								Type: 'movie',
								Year: '2021',
								Poster: 'test.jpg'
							}
						]
					})
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await actions.search({ request: mockRequest } as any);
			expect(result).toEqual({
				movies: [
					{ imdbID: '123', title: 'Test Movie', type: 'movie', year: '2021', poster: 'test.jpg' }
				]
			});
		});

		it('should return fail if search throws error', async () => {
			const mockRequest = {
				formData: () => {
					const formData = new FormData();
					formData.append('query', 'test');
					return Promise.resolve(formData);
				}
			} as Request;

			(global.fetch as any).mockRejectedValue(new Error('API Error'));

			const result = await actions.search({ request: mockRequest } as any);
			expect(result).toEqual(fail(500, { error: 'Failed to search for movies' }));
		});
	});

	describe('fetchFullMovieDetails action', () => {
		it('should return full movie details if fetch is successful', async () => {
			const mockRequest = {
				formData: () => {
					const formData = new FormData();
					formData.append('id', 'tt1234567');
					return Promise.resolve(formData);
				}
			} as Request;

			const mockResponse = {
				json: () =>
					Promise.resolve({
						imdbID: 'tt1234567',
						Title: 'Test Movie',
						Poster: 'test.jpg',
						Genre: 'Action, Drama',
						Director: 'John Doe',
						Runtime: '120 min',
						Rated: 'PG-13',
						Plot: 'A test movie plot',
						Year: '2021'
					})
			};
			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await actions.fetchFullMovieDetails({ request: mockRequest } as any);
			expect(result).toEqual({
				type: 'success',
				data: {
					movie: JSON.stringify({
						imdbID: 'tt1234567',
						title: 'Test Movie',
						poster: 'test.jpg',
						genre: 'Action, Drama',
						director: 'John Doe',
						runtime: '120 min',
						ageRating: 'PG-13',
						description: 'A test movie plot',
						year: '2021'
					})
				}
			});
		});

		it('should return fail if fetch throws error', async () => {
			const mockRequest = {
				formData: () => {
					const formData = new FormData();
					formData.append('id', 'tt1234567');
					return Promise.resolve(formData);
				}
			} as Request;

			(global.fetch as any).mockRejectedValue(new Error('API Error'));

			const result = await actions.fetchFullMovieDetails({ request: mockRequest } as any);
			expect(result).toEqual(fail(500, { error: 'Failed to fetch movie details' }));
		});
	});

	describe('save action', () => {
		it('should save movie and redirect if successful', async () => {
			const mockRequest = {
				formData: () => {
					const formData = new FormData();
					formData.append('imdbID', 'tt1234567');
					formData.append('title', 'Test Movie');
					formData.append('genres', 'Action, Drama');
					formData.append('director', 'John Doe');
					formData.append('runtime', '120 min');
					formData.append('actors', 'PG-13');
					formData.append('poster', 'test.jpg');
					formData.append('plot', 'A test movie plot');
					formData.append('year', '2021');
					return Promise.resolve(formData);
				}
			} as Request;

			(global.fetch as any).mockResolvedValue({
				json: () => Promise.resolve({ movie_results: [{ id: '12345' }] })
			});

			(db.insert as any).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([{ filmId: 1 }])
				})
			});

			await expect(actions.save({ request: mockRequest } as any)).rejects.toThrow();
			expect(languageAwareModule.languageAwareRedirect).toHaveBeenCalledWith(302, '/admin/film/1');
		});

		it('should return fail if required fields are missing', async () => {
			const mockRequest = {
				formData: () => {
					const formData = new FormData();
					// Missing imdbID and title
					return Promise.resolve(formData);
				}
			} as Request;

			const result = await actions.save({ request: mockRequest } as any);
			expect(result).toEqual(fail(400, { error: 'IMDB ID is required' }));
		});

		it('should return fail if db insert throws error', async () => {
			const mockRequest = {
				formData: () => {
					const formData = new FormData();
					formData.append('imdbID', 'tt1234567');
					formData.append('title', 'Test Movie');
					return Promise.resolve(formData);
				}
			} as Request;

			(global.fetch as any).mockResolvedValue({
				json: () => Promise.resolve({ movie_results: [{ id: '12345' }] })
			});

			(db.insert as any).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockRejectedValue(new Error('DB Error'))
				})
			});

			const result = await actions.save({ request: mockRequest } as any);
			expect(result).toEqual(fail(500, { error: 'Failed to save movie' }));
		});
	});
});
