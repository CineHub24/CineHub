import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { languageAwareRedirect } from '$lib/utils/languageAware';

// Mocks
vi.mock('$lib/server/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([]),
        where: vi.fn().mockResolvedValue([]),
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([])
          })
        })
      })
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([{ id: 'mock-id' }])
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([])
      })
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

describe('Page Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('load function', () => {
    it('should return movies, shows and codes', async () => {
      const mockEvent = {
        cookies: {
          get: vi.fn().mockReturnValue('1')
        }
      };

      vi.mocked(db.select).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Cinema' }]),
          where: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Movie' }]),
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Show' }])
            })
          })
        })
      }));

      const result = await load(mockEvent as any);

      expect(result).toHaveProperty('movies');
      expect(result).toHaveProperty('shows');
      expect(result).toHaveProperty('codes');
    });

    it('should handle errors and return a fail response', async () => {
      const mockEvent = {
        cookies: {
          get: vi.fn().mockReturnValue('1')
        }
      };

      // First call for cinema check returns empty array to trigger error
      vi.mocked(db.select)
        .mockImplementationOnce(() => ({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Cinema' }])
          })
        }))
        // Second call for movies throws error
        .mockImplementationOnce(() => ({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockRejectedValue(new Error('Database error'))
          })
        }));

      const result = await load(mockEvent as any);

      expect(result).toEqual({
        status: 500,
        data: { error: 'Internal Server Error' }
      });
    });
  });

  describe('addToCart action', () => {
    it('should add gift card to cart and redirect', async () => {
      const mockFormData = new FormData();
      mockFormData.append('giftCardId', '1');

      const mockEvent = {
        request: {
          formData: vi.fn().mockResolvedValue(mockFormData)
        },
        locals: {
          user: { id: 'user-1' }
        }
      };

      vi.mocked(db.select).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: '1', amount: 50 }])
        })
      }));

      vi.mocked(db.insert).mockImplementation(() => ({
        values: vi.fn().mockResolvedValue([{ id: 'booking-1', basePrice: 100 }]),
        returning: vi.fn().mockResolvedValue([{ id: 'booking-1', basePrice: 100 }])
      }));

      const result = await actions.addToCart(mockEvent as any);

      expect(languageAwareRedirect).toHaveBeenCalledWith(303, '/cart');
    });

    it('should handle errors and return a fail response', async () => {
      const mockFormData = new FormData();
      mockFormData.append('giftCardId', '1');

      const mockEvent = {
        request: {
          formData: vi.fn().mockResolvedValue(mockFormData)
        },
        locals: {
          user: { id: 'user-1' }
        }
      };

      vi.mocked(db.select).mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      }));

      const result = await actions.addToCart(mockEvent as any);

      expect(result).toEqual({
        status: 500,
        data: { error: 'Internal Server Error' }
      });
    });
  });
});