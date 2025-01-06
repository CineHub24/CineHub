import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fail } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { load, actions } from './+page.server';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { generateUserId, validateEmail, validatePassword } from '$lib/utils/user';
import { hash } from '@node-rs/argon2';
import type { RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import type { PgInsertBuilder } from 'drizzle-orm/pg-core';

// Mocks
vi.mock('$lib/server/auth', () => ({
generateSessionToken: vi.fn(() => 'mock-session-token'),
createSession: vi.fn(() => ({ expiresAt: new Date() })),
setSessionTokenCookie: vi.fn(),
}));

vi.mock('$lib/server/db', () => {
const mockValues = vi.fn().mockResolvedValue([{ id: 'mock-user-id' }]);
const mockInsert: Partial<PgInsertBuilder<any, any>> = {
values: mockValues,
execute: vi.fn().mockImplementation(() => mockValues()),
};
return {
db: {
insert: vi.fn().mockReturnValue(mockInsert),
},
};
});

vi.mock('$lib/utils/languageAware', () => ({
languageAwareRedirect: vi.fn((status, location) => ({ status, location })),
}));

vi.mock('$lib/utils/user', () => ({
generateUserId: vi.fn(() => 'mock-user-id'),
validateEmail: vi.fn((email) => typeof email === 'string' && email.includes('@')),
validatePassword: vi.fn((password) => typeof password === 'string' && password.length >= 8),
}));

vi.mock('@node-rs/argon2', () => ({
hash: vi.fn(() => 'hashed-password'),
}));

// Hilfsfunktion zum Erstellen eines Mock-RequestEvents
function createMockRequestEvent(formData = {}): RequestEvent<Partial<Record<string, string>>, "/register"> {
return {
request: {
formData: vi.fn().mockResolvedValue(new Map(Object.entries(formData))),
},
locals: {},
params: {},
route: {
id: "/register"
},
url: new URL('http://localhost/register'),
isDataRequest: false,
setHeaders: vi.fn(),
cookies: {
get: vi.fn(),
set: vi.fn(),
delete: vi.fn(),
},
} as unknown as RequestEvent<Partial<Record<string, string>>, "/register">;
}

// Hilfsfunktion zum Erstellen eines Mock-ServerLoadEvents
function createMockServerLoadEvent(): ServerLoadEvent<Record<string, string>, { user: any; }, "/register"> {
return {
url: new URL('http://localhost/register'),
params: {},
route: {
id: "/register"
},
isDataRequest: false,
setHeaders: vi.fn(),
parent: async () => ({ user: null }),
depends: vi.fn(),
fetch: vi.fn(),
locals: {},
cookies: {
get: vi.fn(),
set: vi.fn(),
delete: vi.fn(),
},
} as unknown as ServerLoadEvent<Record<string, string>, { user: any; }, "/register">;
}

describe('Register Action', () => {
beforeEach(() => {
vi.clearAllMocks();
});

it('should fail with invalid email', async () => {
const mockEvent = createMockRequestEvent({ email: 'invalid', password: 'validPassword123' });
const result = await actions.register(mockEvent);
expect(result).toEqual(fail(400, { message: 'Invalid email' }));
});

it('should fail with invalid password', async () => {
const mockEvent = createMockRequestEvent({ email: 'valid@email.com', password: 'weak' });
const result = await actions.register(mockEvent);
expect(result).toEqual(fail(400, { message: 'Invalid password' }));
});

it('should successfully register a user', async () => {
const mockEvent = createMockRequestEvent({ email: 'valid@email.com', password: 'validPassword123' });
const result = await actions.register(mockEvent);

expect(validateEmail).toHaveBeenCalledWith('valid@email.com');
expect(validatePassword).toHaveBeenCalledWith('validPassword123');
expect(generateUserId).toHaveBeenCalled();
expect(hash).toHaveBeenCalledWith('validPassword123', expect.objectContaining({
memoryCost: 19456,
timeCost: 2,
outputLen: 32,
parallelism: 1
}));

expect(db.insert).toHaveBeenCalledWith(table.user);
expect(vi.mocked(db.insert).mock.results[0].value.values).toHaveBeenCalledWith({
id: 'mock-user-id',
email: 'valid@email.com',
password: 'hashed-password'
});

expect(auth.generateSessionToken).toHaveBeenCalled();
expect(auth.createSession).toHaveBeenCalledWith('mock-session-token', 'mock-user-id');
expect(auth.setSessionTokenCookie).toHaveBeenCalledWith(mockEvent, 'mock-session-token', expect.any(Date));
expect(languageAwareRedirect).toHaveBeenCalledWith(302, '/');
expect(result).toEqual({ status: 302, location: '/' });
});

it('should handle database errors', async () => {
const mockError = new Error('Database error');
vi.mocked(db.insert).mockReturnValueOnce({
values: vi.fn().mockRejectedValueOnce(mockError),
execute: vi.fn().mockRejectedValueOnce(mockError),
} as unknown as PgInsertBuilder<any, any>);

const mockEvent = createMockRequestEvent({ email: 'valid@email.com', password: 'validPassword123' });

const result = await actions.register(mockEvent);
expect(result).toEqual(fail(500, { message: expect.stringContaining('An error has occurred') }));
});
});

describe('Load Function', () => {
it('should return an empty object', async () => {
const result = await load(createMockServerLoadEvent());
expect(result).toEqual({});
});
});