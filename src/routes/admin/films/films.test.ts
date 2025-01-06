import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import * as dbModule from '$lib/server/db';
import { film } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

// Mock the entire db module
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn().mockReturnThis(),
from: vi.fn().mockReturnThis(),
}
}));

// Mock fail function
vi.mock('@sveltejs/kit', () => ({
fail: vi.fn((status, data) => ({ status, data }))
}));

describe('load function', () => {
beforeEach(() => {
vi.clearAllMocks();
});

it('should return all movies when successful', async () => {
const mockMovies = [
{ id: 1, title: 'Movie 1' },
{ id: 2, title: 'Movie 2' },
];

const mockDb = dbModule.db as any;
mockDb.from.mockResolvedValue(mockMovies);

const result = await load({} as any);

expect(mockDb.select).toHaveBeenCalled();
expect(mockDb.from).toHaveBeenCalledWith(film);
expect(result).toEqual({
movies: mockMovies
});
});

it('should handle empty result', async () => {
const mockDb = dbModule.db as any;
mockDb.from.mockResolvedValue([]);

const result = await load({} as any);

expect(mockDb.select).toHaveBeenCalled();
expect(mockDb.from).toHaveBeenCalledWith(film);
expect(result).toEqual({
movies: []
});
});

it('should handle database errors', async () => {
const mockError = new Error('Database error');
const mockDb = dbModule.db as any;
mockDb.from.mockRejectedValue(mockError);

const consoleSpy = vi.spyOn(console, 'log');

const result = await load({} as any);

expect(consoleSpy).toHaveBeenCalledWith(mockError);
expect(fail).toHaveBeenCalledWith(500, { error: 'Failed to load movies' });
expect(result).toEqual({ status: 500, data: { error: 'Failed to load movies' } });
});
});