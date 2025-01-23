import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './+server'; // Passen Sie den Pfad entsprechend an
import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { subscribersNewsletter } from '$lib/server/db/schema';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
db: {
insert: vi.fn(() => ({
values: vi.fn(),
})),
},
}));

vi.mock('@sveltejs/kit', () => ({
json: vi.fn((data, options) => ({ body: JSON.stringify(data), status: options?.status || 200 })),
}));

describe('POST function for newsletter subscription', () => {
beforeEach(() => {
vi.clearAllMocks();
});

it('should return an error if no email is provided', async () => {
const request = {
json: vi.fn().mockResolvedValue({}),
};

const response = await POST({ request } as any);

expect(json).toHaveBeenCalledWith({ error: 'Keine E-Mail angegeben!' }, { status: 400 });
});

it('should successfully subscribe an email', async () => {
const email = 'test@example.com';
const request = {
json: vi.fn().mockResolvedValue({ email }),
};

const insertMock = vi.fn().mockResolvedValue(undefined);
vi.mocked(db.insert).mockReturnValue({ values: insertMock });

const response = await POST({ request } as any);

expect(db.insert).toHaveBeenCalledWith(subscribersNewsletter);
expect(insertMock).toHaveBeenCalledWith({ email });
expect(json).toHaveBeenCalledWith({ message: 'Erfolgreich angemeldet!' });
});

it('should handle duplicate email error', async () => {
    const email = 'test@example.com';
    const request = { json: vi.fn().mockResolvedValue({ email }) };
    
    const error = new Error('Duplicate email');
    (error as any).code = '23505';
    const valuesMock = vi.fn().mockRejectedValue(error);
    vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as any);
    
    const response = await POST({ request } as any);
    
    expect(json).toHaveBeenCalledWith({ error: 'E-Mail bereits angemeldet!' }, { status: 400 });
    expect(response).toEqual({
    body: JSON.stringify({ error: 'E-Mail bereits angemeldet!' }),
    status: 400
    });
    });
it('should handle general errors', async () => {
const email = 'test@example.com';
const request = {
json: vi.fn().mockResolvedValue({ email }),
};

const insertMock = vi.fn().mockRejectedValue(new Error('Database error'));
vi.mocked(db.insert).mockReturnValue({ values: insertMock });

const response = await POST({ request } as any);

expect(json).toHaveBeenCalledWith({ error: 'Fehler beim Verarbeiten der Anfrage.' }, { status: 500 });
});
});