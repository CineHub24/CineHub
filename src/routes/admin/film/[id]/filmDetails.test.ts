import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import { film, showing, cinemaHall, priceSet } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import * as languageAwareModule from '$lib/utils/languageAware.js';
import * as timeSlotsModule from '$lib/utils/timeSlots.js';

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					limit: vi.fn()
				}))
			}))
		})),
		delete: vi.fn(() => ({
			where: vi.fn()
		})),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn()
			}))
		})),
		insert: vi.fn(() => ({
			values: vi.fn()
		}))
	}
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn(),
	lt: vi.fn(),
	gte: vi.fn(),
	ne: vi.fn(),
	sql: vi.fn(),
	and: vi.fn()
}));

vi.mock('$lib/utils/languageAware.js', () => ({
	languageAwareRedirect: vi.fn()
}));

vi.mock('$lib/utils/timeSlots.js', () => ({
	getFreeTimeSlots: vi.fn()
}));

describe('load function', () => {
	it('should load film and related data', async () => {
		const mockFilm = { id: 1, title: 'Test Movie' };
		const mockShows = [{ id: 1, filmid: 1 }];
		const mockHalls = [{ id: 1, name: 'Hall 1' }];
		const mockPriceSets = [{ id: 1, name: 'Standard' }];

		(db.select as any)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([mockFilm]) })
			})
			.mockReturnValueOnce({
				from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(mockShows) })
			})
			.mockReturnValueOnce({ from: vi.fn().mockResolvedValue(mockHalls) })
			.mockReturnValueOnce({ from: vi.fn().mockResolvedValue(mockPriceSets) });

		const result = await load({ url: new URL('http://localhost/films/1') } as any);

		expect(result).toEqual({
			film: mockFilm,
			shows: mockShows,
			halls: mockHalls,
			priceSets: mockPriceSets
		});
	});
});

describe('actions', () => {
	describe('delete action', () => {
		it('should delete a film', async () => {
			const mockRequest = {} as Request;
			const mockUrl = new URL('http://localhost/films/1');

			const result = await actions.delete({ request: mockRequest, url: mockUrl } as any);

			expect(db.delete).toHaveBeenCalledWith(film);
			expect(languageAwareModule.languageAwareRedirect).toHaveBeenCalledWith(302, '/admin/films');
		});

		it('should handle errors', async () => {
			const mockRequest = {} as Request;
			const mockUrl = new URL('http://localhost/films/1');

			(db.delete as any).mockImplementation(() => {
				throw new Error('Database error');
			});

			const result = await actions.delete({ request: mockRequest, url: mockUrl } as any);
			expect(result).toEqual(fail(500, { error: 'Failed to delete film' }));
		});
	});

	describe('update action', () => {
		it('should update a film', async () => {
			const mockFormData = new FormData();
			mockFormData.append('title', 'Updated Movie');
			mockFormData.append('genre', 'Action, Drama');
			mockFormData.append('runtime', '120');
			mockFormData.append('director', 'John Doe');
			mockFormData.append('description', 'A great movie');

			const mockRequest = {
				formData: () => Promise.resolve(mockFormData)
			} as Request;
			const mockUrl = new URL('http://localhost/films/1');

			const result = await actions.update({ request: mockRequest, url: mockUrl } as any);

			expect(db.update).toHaveBeenCalledWith(film);
			expect(result).toEqual({ success: 'Film erfolgreich aktualisiert' });
		});

		it('should handle invalid input', async () => {
			const mockFormData = new FormData();
			mockFormData.append('title', 'Test Movie');
			mockFormData.append('genre', 'Action, Drama');
			mockFormData.append('runtime', 'invalid');
			mockFormData.append('director', 'John Doe');
			mockFormData.append('description', 'A test movie');

			const mockRequest = {
				formData: () => Promise.resolve(mockFormData)
			} as Request;
			const mockUrl = new URL('http://localhost/films/1');

			const result = await actions.update({ request: mockRequest, url: mockUrl } as any);
			expect(result).toEqual(fail(400, { error: 'Invalid runtime' }));
		});
	});

	describe('create action', () => {
		it('should create a showing', async () => {
			const mockFormData = new FormData();
			mockFormData.append('date', '2023-07-01');
			mockFormData.append('time', '20:00');
			mockFormData.append('hall', '1');
			mockFormData.append('priceSet', '1');

			const mockRequest = {
				formData: () => Promise.resolve(mockFormData)
			} as Request;
			const mockUrl = new URL('http://localhost/films/1');

			(db.select as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ runtime: 120 }])
					})
				})
			});

			vi.mocked(timeSlotsModule.getFreeTimeSlots).mockResolvedValue([
				{ start: '20:00', end: '22:00', date: '2023-07-01', hallid: 1, priceSetId: 1 }
			]);

			const result = await actions.create({ request: mockRequest, url: mockUrl } as any);

			expect(result).toEqual({
				slots: [{ start: '20:00', end: '22:00', date: '2023-07-01', hallid: 1, priceSetId: 1 }]
			});
		});

		it('should handle errors', async () => {
			const mockFormData = new FormData();
			mockFormData.append('date', '2023-07-01');
			mockFormData.append('time', '20:00');
			mockFormData.append('hall', '1');
			mockFormData.append('priceSet', '1');

			const mockRequest = {
				formData: () => Promise.resolve(mockFormData)
			} as Request;
			const mockUrl = new URL('http://localhost/films/1');

			(db.select as any).mockImplementation(() => {
				throw new Error('Database error');
			});

			const result = await actions.create({ request: mockRequest, url: mockUrl } as any);
			expect(result).toEqual(fail(500, { error: 'Failed to create showing' }));
		});
	});

	describe('save action', () => {
		it('should save a showing', async () => {
			const mockFormData = new FormData();
			mockFormData.append('date', '2023-07-01');
			mockFormData.append('slotStart', '20:00');
			mockFormData.append('slotEnd', '22:00');
			mockFormData.append('hall', '1');
			mockFormData.append('filmId', '1');
			mockFormData.append('priceSet', '1');

			const mockRequest = {
				formData: () => Promise.resolve(mockFormData)
			} as Request;
			const mockUrl = new URL('http://localhost/films/1');

			const result = await actions.save({ request: mockRequest, url: mockUrl } as any);

			expect(db.insert).toHaveBeenCalledWith(showing);
			expect(result).toEqual({ success: 'Showing successfully saved' });
		});

		it('should handle errors', async () => {
			const mockFormData = new FormData();
			mockFormData.append('date', '2023-07-01');
			mockFormData.append('slotStart', '20:00');
			mockFormData.append('slotEnd', '22:00');
			mockFormData.append('hall', '1');
			mockFormData.append('filmId', '1');
			mockFormData.append('priceSet', '1');

			const mockRequest = {
				formData: () => Promise.resolve(mockFormData)
			} as Request;
			const mockUrl = new URL('http://localhost/films/1');

			(db.insert as any).mockImplementation(() => {
				throw new Error('Database error');
			});

			const result = await actions.save({ request: mockRequest, url: mockUrl } as any);
			expect(result).toEqual(fail(500, { error: 'Failed to save showing' }));
		});
	});
});
