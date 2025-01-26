import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import { db } from '$lib/server/db';
import { film } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

// Mock the database module
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn().mockReturnThis(),
from: vi.fn().mockReturnThis(),
where: vi.fn().mockResolvedValue([]),
},
}));

describe('Search Page Load Function', () => {
beforeEach(() => {
vi.clearAllMocks();
});

it('should return films matching the search term', async () => {
const mockFilms = [
{ id: 1, title: 'Test Movie', description: 'A test movie', director: 'Test Director' },
];
vi.mocked(db.where).mockResolvedValue(mockFilms);

const result = await load({ params: { searchTerm: 'test' } } as any);

expect(db.select).toHaveBeenCalled();
expect(db.from).toHaveBeenCalledWith(film);
expect(db.where).toHaveBeenCalled();
expect(result).toEqual({
success: true,
films: mockFilms,
searchTerm: 'test',
});
});

it('should return an empty array if no films match the search term', async () => {
vi.mocked(db.where).mockResolvedValue([]);

const result = await load({ params: { searchTerm: 'nonexistent' } } as any);

expect(result).toEqual({
success: true,
films: [],
searchTerm: 'nonexistent',
});
});

it('should return a fail object with a 500 status on database error', async () => {
vi.mocked(db.where).mockRejectedValue(new Error('Database error'));

const result = await load({ params: { searchTerm: 'test' } } as any);

expect(result).toEqual(fail(500, { error: 'Internal server error' }));
});
});