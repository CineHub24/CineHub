import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import { db } from '$lib/server/db';
import { languageAwareRedirect } from '$lib/utils/languageAware';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn().mockReturnThis(),
from: vi.fn().mockReturnThis(),
innerJoin: vi.fn().mockReturnThis(),
where: vi.fn().mockReturnThis(),
orderBy: vi.fn().mockReturnThis()
}
}));

vi.mock('$lib/utils/languageAware', () => ({
languageAwareRedirect: vi.fn()
}));

describe('Page Load Handler', () => {
beforeEach(() => {
vi.clearAllMocks();
});

it('should redirect to login if user is not authenticated', async () => {
const event = {
locals: { user: null }
};

await load(event as any);

expect(languageAwareRedirect).toHaveBeenCalledWith(301, '/login');
});

it('should load paid tickets for authenticated user', async () => {
const mockTickets = [
{
id: 1,
token: 'token1',
type: 'Adult',
status: 'paid',
price: 10,
sitzreihe: 'A',
sitzplatz: 1,
film: 'Test Movie',
datum: new Date('2025-01-22T18:47:02.652Z'),
uhrzeit: '20:00',
saal: 'Hall 1',
showingId: 1,
seatCategory: 'Standard'
}
];

// Mock the database query to return mockTickets
vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnThis(),
innerJoin: vi.fn().mockReturnThis(),
where: vi.fn().mockReturnThis(),
orderBy: vi.fn().mockResolvedValue(mockTickets)
} as any);

const event = {
locals: { user: { id: 'user1' } }
};

const result = await load(event as any);

expect(result).toEqual({ tickets: mockTickets });
expect(db.select).toHaveBeenCalled();
});
});