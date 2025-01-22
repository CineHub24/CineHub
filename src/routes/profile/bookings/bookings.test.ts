import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn().mockReturnThis(),
from: vi.fn().mockReturnThis(),
where: vi.fn().mockReturnThis(),
orderBy: vi.fn().mockReturnThis(),
}
}));

describe('Bookings Page', () => {
beforeEach(() => {
vi.clearAllMocks();
});

it('should return fail response if user is not authenticated', async () => {
const event = { locals: { user: null } };
const result = await load(event as any);
expect(result).toEqual(fail(401, { error: 'Unauthorized' }));
});

it('should return bookings for authenticated user', async () => {
const mockUser = { id: 'user1' };
const mockBookings = [
{ id: 'booking1', userId: 'user1', status: 'completed', date: new Date() },
{ id: 'booking2', userId: 'user1', status: 'completed', date: new Date() }
];

vi.mocked(db.select().from().where().orderBy).mockResolvedValue(mockBookings);

const event = { locals: { user: mockUser } };
const result = await load(event as any);

expect(result).toEqual({ bookings: mockBookings });
expect(db.select).toHaveBeenCalled();
});

it('should return fail response on database error', async () => {
const mockUser = { id: 'user1' };
vi.mocked(db.select().from().where().orderBy).mockRejectedValue(new Error('Database error'));

const event = { locals: { user: mockUser } };
const result = await load(event as any);

expect(result).toEqual(fail(500, { error: 'Internal Server Error' }));
});
});