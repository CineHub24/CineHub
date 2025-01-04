import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import { db } from '$lib/server/db';
import { cinema, cinemaHall, film, priceSet } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';

vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn()
}
}));

vi.mock('@sveltejs/kit', () => ({
fail: vi.fn((status, data) => ({ status, data }))
}));

describe('load function', () => {
beforeEach(() => {
vi.clearAllMocks();
});

it('should load movies, halls, and price sets', async () => {
const mockMovies = [{ id: 1, title: 'Test Movie' }];
const mockHalls = [{ id: 1, name: 'Test Hall', cinema: { id: 1, name: 'Test Cinema' } }];
const mockPriceSets = [{ id: 1, name: 'Standard' }];

const mockExecute = vi.fn();
mockExecute.mockResolvedValueOnce(mockMovies);
mockExecute.mockResolvedValueOnce(mockHalls);
mockExecute.mockResolvedValueOnce(mockPriceSets);

const mockFrom = vi.fn().mockReturnThis();
const mockLeftJoin = vi.fn().mockReturnThis();

const mockSelect = {
from: mockFrom,
leftJoin: mockLeftJoin,
execute: mockExecute,
};

vi.mocked(db.select).mockReturnValue(mockSelect as any);

const result = await load({} as any);

expect(result).toEqual({
movies: mockSelect,
halls: mockSelect,
priceSets: mockSelect
});

expect(db.select).toHaveBeenCalledTimes(3);
expect(mockFrom).toHaveBeenCalledTimes(3);
expect(mockLeftJoin).toHaveBeenCalledTimes(1);
// Wir erwarten nicht, dass execute aufgerufen wird, da die load-Funktion
// die Query-Objekte direkt zurückgibt
expect(mockExecute).not.toHaveBeenCalled();
});

it('should return a fail response on error', async () => {
const mockExecute = vi.fn().mockRejectedValueOnce(new Error('Database error'));

vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnThis(),
leftJoin: vi.fn().mockReturnThis(),
execute: mockExecute,
} as any);

const result = await load({} as any);

expect(result).toEqual({
status: 500,
data: { error: 'Failed to load movies' }
});
expect(fail).toHaveBeenCalledWith(500, { error: 'Failed to load movies' });
});
});