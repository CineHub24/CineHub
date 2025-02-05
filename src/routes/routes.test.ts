import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { languageAwareRedirect } from '$lib/utils/languageAware';

// Mocks
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn().mockReturnValue({
			from: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockResolvedValue([]),
			where: vi.fn().mockResolvedValue([]),
			innerJoin: vi.fn().mockReturnThis()
		}),
		insert: vi.fn().mockReturnValue({
			values: vi.fn().mockReturnThis(),
			returning: vi.fn().mockResolvedValue([])
		}),
		update: vi.fn().mockReturnValue({
			set: vi.fn().mockReturnThis(),
			where: vi.fn().mockResolvedValue([])
		})
	}
}));

vi.mock('$lib/utils/languageAware', () => ({
	languageAwareRedirect: vi.fn().mockReturnValue({ status: 303, location: '/cart' })
}));

vi.mock('@sveltejs/kit', async () => {
	const actual = await vi.importActual('@sveltejs/kit');
	return {
		...actual,
		fail: vi.fn().mockImplementation((status, data) => ({ status, data }))
	};
});

describe('page.server.ts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load function', () => {
		it('should return movies, shows and codes', async () => {
      const mockEvent = {
        cookies: {
          get: vi.fn().mockReturnValue('')
        }
      };

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Cinema' }])
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Movie' }])
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Show' }])
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Gift Code' }])
        } as any);

      const result = await load(mockEvent as any);

      expect(result).toHaveProperty('movies');
      expect(result).toHaveProperty('shows');
      expect(result).toHaveProperty('codes');
    });

		it('should handle errors', async () => {
			const mockEvent = {
				cookies: {
					get: vi.fn().mockReturnValue('1')
				}
			};

			vi.mocked(db.select).mockImplementation(() => {
				throw new Error('Database error');
			});

			const result = await load(mockEvent as any);

			expect(result).toEqual({
				status: 500,
				data: { error: 'Internal Server Error' }
			});
		});
	});

	describe('addToCart action', () => {
		it('should redirect to login if user is not authenticated', async () => {
			const result = await actions.addToCart({
				locals: {},
				request: {} as Request
			} as any);

			expect(languageAwareRedirect).toHaveBeenCalledWith(301, '/login');
		});

		it('should add gift card to cart successfully', async () => {
			const mockFormData = new FormData();
			mockFormData.append('giftCardId', '1');

			const mockRequest = {
				formData: vi.fn().mockResolvedValue(mockFormData)
			};

			vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([{ id: '1', amount: 50 }])
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([{ id: 'booking-1', basePrice: 100 }])
        } as any);

			vi.mocked(db.insert).mockReturnValue({
				values: vi.fn().mockReturnThis(),
				returning: vi.fn().mockResolvedValue([{ id: 'booking-1' }])
			} as any);

			const result = await actions.addToCart({
				request: mockRequest as any,
				locals: { user: { id: 'user-1' } }
			} as any);

			expect(languageAwareRedirect).toHaveBeenCalledWith(303, '/cart');
		});

		it('should handle errors', async () => {
			const mockFormData = new FormData();
			mockFormData.append('giftCardId', '1');

			const mockRequest = {
				formData: vi.fn().mockResolvedValue(mockFormData)
			};

			vi.mocked(db.select).mockRejectedValue(new Error('Database error'));

			const result = await actions.addToCart({
				request: mockRequest as any,
				locals: { user: { id: 'user-1' } }
			} as any);

			expect(result).toEqual({
				status: 500,
				data: { error: 'Internal Server Error' }
			});
		});
	});
});
