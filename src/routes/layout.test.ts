import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+layout.server';
import { db } from '$lib/server/db';
import { cinema } from '$lib/server/db/schema';

// Mock the database module
vi.mock('$lib/server/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([])
      })
    })
  }
}));

describe('Cinema Page Server Load', () => {
  const mockCinemas = [
    { id: 1, name: 'Cinema A' },
    { id: 2, name: 'Cinema B' },
    { id: 3, name: 'Cinema C' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load cinemas and return user data', async () => {
    const mockEvent = {
      locals: {
        user: { id: 'user-1', name: 'Test User' }
      },
      cookies: {
        get: vi.fn().mockReturnValue(null)
      }
    };

    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue(mockCinemas)
      })
    }));

    const result = await load(mockEvent as any);

    expect(result).toEqual({
      user: mockEvent.locals.user,
      cinemas: expect.arrayContaining(mockCinemas)
    });
    expect(result.cinemas[0]).toEqual(mockCinemas[0]);
  });

  it('should handle preferred cinema and move it to the beginning', async () => {
    const mockEvent = {
      locals: {
        user: { id: 'user-1', name: 'Test User' }
      },
      cookies: {
        get: vi.fn().mockReturnValue('2') // Preferred cinema ID
      }
    };

    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([...mockCinemas])
      })
    }));

    const result = await load(mockEvent as any);

    // Check if the cinema with ID 2 is at the beginning
    expect(result.cinemas[0].id).toBe(2);
    expect(result.cinemas.length).toBe(mockCinemas.length);
    expect(result.cinemas).toContainEqual(mockCinemas[1]);
  });

  it('should handle case when preferred cinema does not exist', async () => {
    const mockEvent = {
      locals: {
        user: { id: 'user-1', name: 'Test User' }
      },
      cookies: {
        get: vi.fn().mockReturnValue('999') // Non-existent cinema ID
      }
    };

    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([...mockCinemas])
      })
    }));

    const result = await load(mockEvent as any);

    // Should maintain original order since preferred cinema wasn't found
    expect(result.cinemas[0]).toEqual(mockCinemas[0]);
    expect(result.cinemas).toEqual(mockCinemas);
  });

  it('should use first cinema when no preferred cinema is set', async () => {
    const mockEvent = {
      locals: {
        user: { id: 'user-1', name: 'Test User' }
      },
      cookies: {
        get: vi.fn().mockReturnValue(null)
      }
    };

    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([...mockCinemas])
      })
    }));

    const result = await load(mockEvent as any);

    // First cinema should be at the beginning
    expect(result.cinemas[0]).toEqual(mockCinemas[0]);
    expect(result.cinemas).toEqual(mockCinemas);
  });

  it('should handle database errors', async () => {
    const mockEvent = {
      locals: {
        user: { id: 'user-1', name: 'Test User' }
      },
      cookies: {
        get: vi.fn().mockReturnValue(null)
      }
    };

    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockRejectedValue(new Error('Database error'))
      })
    }));

    await expect(load(mockEvent as any)).rejects.toThrow('Database error');
  });

  it('should handle empty cinema list', async () => {
    const mockEvent = {
      locals: {
        user: { id: 'user-1', name: 'Test User' }
      },
      cookies: {
        get: vi.fn().mockReturnValue('1')
      }
    };

    vi.mocked(db.select).mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([])
      })
    }));

    const result = await load(mockEvent as any);

    expect(result.cinemas).toEqual([]);
    expect(result.user).toEqual(mockEvent.locals.user);
  });
});