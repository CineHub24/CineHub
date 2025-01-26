import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './+server';
import { db } from '$lib/server/db';
import { subscribersNewsletter } from '$lib/server/db/schema';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
db: {
delete: vi.fn().mockReturnValue({
where: vi.fn(),
}),
},
}));

vi.mock('drizzle-orm', async () => {
const actual = await vi.importActual('drizzle-orm');
return {
...actual,
eq: vi.fn(),
sql: vi.fn(),
};
});

vi.mock('$lib/server/db/schema', () => ({
subscribersNewsletter: {
email: 'email',
},
}));

describe('GET function for newsletter unsubscription', () => {
beforeEach(() => {
vi.clearAllMocks();
});

it('should successfully unsubscribe an email', async () => {
const email = 'test@example.com';
const params = { email: encodeURIComponent(email) };

const whereMock = vi.fn().mockResolvedValue(undefined);
vi.mocked(db.delete).mockReturnValue({ where: whereMock } as any);

const response = await GET({ params } as any);

expect(db.delete).toHaveBeenCalledWith(subscribersNewsletter);
expect(whereMock).toHaveBeenCalled();
expect(response.status).toBe(302);
expect(response.headers.get('Location')).toBe('/newsletter/unsubscribed');
});

it('should handle errors during unsubscription', async () => {
const email = 'test@example.com';
const params = { email: encodeURIComponent(email) };

const whereMock = vi.fn().mockRejectedValue(new Error('Database error'));
vi.mocked(db.delete).mockReturnValue({ where: whereMock } as any);

const response = await GET({ params } as any);

expect(db.delete).toHaveBeenCalledWith(subscribersNewsletter);
expect(whereMock).toHaveBeenCalled();
expect(response.status).toBe(500);

const responseBody = await response.json();
expect(responseBody).toEqual({ error: 'Abmeldung fehlgeschlagen' });
});
});