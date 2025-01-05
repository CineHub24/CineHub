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
const mockSelect = {
from: vi.fn().mockReturnThis(),
leftJoin: vi.fn().mockReturnThis(),
};

vi.mocked(db.select).mockReturnValue(mockSelect as any);

const result = await load({} as any);

expect(result).toEqual({
movies: mockSelect,
halls: mockSelect,
priceSets: mockSelect
});

expect(db.select).toHaveBeenCalledTimes(3);
expect(mockSelect.from).toHaveBeenCalledTimes(3);
expect(mockSelect.leftJoin).toHaveBeenCalledTimes(1);
});

it('should return a fail response on error', async () => {
const mockSelect = {
from: vi.fn().mockReturnThis(),
leftJoin: vi.fn().mockReturnThis(),
};

// Simulate an error on the first db.select call
vi.mocked(db.select)
.mockImplementationOnce(() => { throw new Error('Database error'); })
.mockReturnValue(mockSelect as any);

const result = await load({} as any);

expect(result).toEqual({
status: 500,
data: { error: 'Failed to load movies' }
});
expect(fail).toHaveBeenCalledWith(500, { error: 'Failed to load movies' });
});
});