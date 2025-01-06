import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fail } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { load, actions } from './+page.server'; // Stellen Sie sicher, dass dieser Pfad korrekt ist
import { languageAwareRedirect } from '$lib/utils/languageAware';
import type { ServerLoadEvent } from '@sveltejs/kit';

// Definieren Sie einen benutzerdefinierten Typ für Ihr Event
type CustomServerLoadEvent = ServerLoadEvent<Partial<Record<string, string>>, { user: any; session?: any }, "/profile">;

// Mocks
vi.mock('@sveltejs/kit', () => ({
fail: vi.fn((status, data) => ({ status, data })),
}));

vi.mock('$lib/server/auth', () => ({
invalidateSession: vi.fn(),
deleteSessionTokenCookie: vi.fn(),
}));

vi.mock('$lib/utils/languageAware', () => ({
languageAwareRedirect: vi.fn((status, location) => ({ status, location })),
}));

// Hilfsfunktion zum Erstellen eines vollständigen Mock-Events
function createMockEvent(overrides = {}): CustomServerLoadEvent {
return {
locals: { user: null, session: null },
cookies: {
get: vi.fn(),
set: vi.fn(),
delete: vi.fn(),
},
fetch: vi.fn(),
getClientAddress: vi.fn(),
params: {},
platform: {},
request: {
formData: vi.fn(),
headers: new Headers(),
json: vi.fn(),
method: 'GET',
url: 'http://localhost',
},
route: {
id: "/profile",
},
setHeaders: vi.fn(),
url: new URL('http://localhost'),
isDataRequest: false,
parent: vi.fn(),
depends: vi.fn(),
untrack: vi.fn(),
isSubRequest: false,
...overrides,
} as unknown as CustomServerLoadEvent;
}

describe('Profile Module', () => {
describe('load function', () => {
it('should redirect if user is not logged in', async () => {
const mockEvent = createMockEvent({ locals: { user: null } });

const result = await load(mockEvent);
expect(languageAwareRedirect).toHaveBeenCalledWith(301, '/login');
expect(result).toEqual({ status: 301, location: '/login' });
});

it('should return user data if user is logged in', async () => {
const mockUser = { id: '1', name: 'Test User' };
const mockEvent = createMockEvent({ locals: { user: mockUser } });

const result = await load(mockEvent);
expect(result).toEqual({ user: mockUser });
});
});

describe('logout action', () => {
    beforeEach(() => {
    vi.resetAllMocks();
    });
    
    it('should fail if no session exists', async () => {
    const mockEvent = createMockEvent({ locals: { user: null, session: null } });
    
    const result = await actions.logout(mockEvent);
    expect(fail).toHaveBeenCalledWith(401, { error: 'Unauthorized' });
    expect(result).toBeUndefined();
    });
    
    it('should invalidate session and redirect on successful logout', async () => {
    const mockEvent = createMockEvent({
    locals: {
    user: { id: '1', name: 'Test User' },
    session: { id: 'session-id' },
    },
    });
    
    await expect(actions.logout(mockEvent)).rejects.toThrow();
    expect(auth.invalidateSession).toHaveBeenCalledWith('session-id');
    expect(auth.deleteSessionTokenCookie).toHaveBeenCalledWith(mockEvent);
    expect(languageAwareRedirect).toHaveBeenCalledWith(303, '/');
    });
    
    it('should handle errors during logout', async () => {
    const mockEvent = createMockEvent({
    locals: {
    user: { id: '1', name: 'Test User' },
    session: { id: 'session-id' },
    },
    });
    
    vi.mocked(auth.invalidateSession).mockRejectedValue(new Error('Test error'));
    
    const result = await actions.logout(mockEvent);
    expect(fail).toHaveBeenCalledWith(500, { error: 'Internal Server Error' });
    // Test ist hier nicht optimal - wir sollten prüfen, ob die Fehlerbehandlung korrekt ist. Allerdings ist dies schiwerig, da der redirect in der Funktion geworfen wird.
    expect(result).toBeUndefined();
    });
    });
});