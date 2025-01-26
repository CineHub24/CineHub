import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './+server'; // Passen Sie den Pfad entsprechend an
import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import { booking, ticket } from '$lib/server/db/schema';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn(() => ({
from: vi.fn(() => ({
where: vi.fn(() => ({
then: vi.fn(),
})),
})),
})),
},
}));

vi.mock('@sveltejs/kit', () => ({
json: vi.fn((data) => data),
error: vi.fn((status, message) => { throw { status, body: message }; }),
}));

describe('GET function', () => {
beforeEach(() => {
vi.clearAllMocks();
vi.useFakeTimers();
});

afterEach(() => {
vi.useRealTimers();
});

it('should return null timeLeft if user is not logged in', async () => {
const result = await GET({ locals: {} });
expect(result).toEqual({ timeLeft: null });
});

it('should return null timeLeft if no active booking is found', async () => {
vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([]),
}),
} as any);

const result = await GET({ locals: { user: { id: 'user1' } } });
expect(result).toEqual({ timeLeft: null });
});

it('should return null timeLeft if no tickets are found', async () => {
vi.mocked(db.select).mockReturnValueOnce({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([{ id: 'booking1' }]),
}),
} as any).mockReturnValueOnce({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([]),
}),
} as any);

const result = await GET({ locals: { user: { id: 'user1' } } });
expect(result).toEqual({ timeLeft: null });
});

it('should calculate and return remaining time', async () => {
const mockNow = new Date('2023-01-01T12:00:00Z');
vi.setSystemTime(mockNow);

const mockCreatedAt = new Date('2023-01-01T11:55:00Z'); // 5 minutes ago
vi.mocked(db.select).mockReturnValueOnce({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([{ id: 'booking1' }]),
}),
} as any).mockReturnValueOnce({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([
{ ticket: { createdAt: mockCreatedAt } },
{ ticket: { createdAt: mockNow } },
]),
}),
} as any);

const result = await GET({ locals: { user: { id: 'user1' } } });
expect(typeof result.timeLeft).toBe('number');
expect(result.timeLeft).toBeGreaterThan(0);
expect(result.timeLeft).toBeLessThanOrEqual(600); // 10 minutes in seconds
});

it('should return null timeLeft if booking window has expired', async () => {
const mockNow = new Date('2023-01-01T12:00:00Z');
vi.setSystemTime(mockNow);

const mockCreatedAt = new Date('2023-01-01T11:40:00Z'); // 20 minutes ago
vi.mocked(db.select).mockReturnValueOnce({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([{ id: 'booking1' }]),
}),
} as any).mockReturnValueOnce({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([{ ticket: { createdAt: mockCreatedAt } }]),
}),
} as any);

const result = await GET({ locals: { user: { id: 'user1' } } });
expect(result).toEqual({ timeLeft: null });
});

it('should throw an error if database operation fails', async () => {
vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockRejectedValue(new Error('Database error')),
}),
} as any);

await expect(GET({ locals: { user: { id: 'user1' } } })).rejects.toEqual({
status: 500,
body: 'Failed to load cart timer data',
});
});
});