import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import * as auth from '$lib/server/auth';
import { EmailService } from '$lib/utils/emailService';
import { fail } from '@sveltejs/kit';
import { generateUserId, validateEmail, validatePassword } from '$lib/utils/user';
import { languageAwareRedirect } from '$lib/utils/languageAware';

// Mocks
vi.mock('$lib/server/db', () => ({
db: {
insert: vi.fn().mockReturnValue({
values: vi.fn().mockResolvedValue([{ id: 'mock-id' }])
})
}
}));

vi.mock('$lib/server/auth', () => ({
generateSessionToken: vi.fn().mockReturnValue('mock-token'),
createSession: vi.fn().mockResolvedValue({ expiresAt: new Date() }),
setSessionTokenCookie: vi.fn()
}));

vi.mock('$lib/utils/emailService', () => ({
EmailService: vi.fn().mockImplementation(() => ({
sendWelcomeEmail: vi.fn().mockResolvedValue(undefined)
}))
}));

vi.mock('argon2', () => ({
hash: vi.fn().mockResolvedValue('mocked-hash')
}));

vi.mock('$lib/utils/user', () => ({
generateUserId: vi.fn().mockReturnValue('mock-user-id'),
validateEmail: vi.fn().mockReturnValue(true),
validatePassword: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/utils/languageAware', () => ({
languageAwareRedirect: vi.fn().mockReturnValue({ status: 302, location: '/' })
}));

describe('Registration process', () => {
beforeAll(() => {
vi.mock('@sveltejs/kit', async () => {
const actual = await vi.importActual('@sveltejs/kit');
return {
...actual,
fail: vi.fn().mockImplementation((status, data) => ({ status, data }))
};
});
});

beforeEach(() => {
vi.clearAllMocks();
});

describe('load function', () => {
it('should return an empty object', async () => {
const result = await load({} as any);
expect(result).toEqual({});
});
});

describe('register action', () => {
it('should register a new user successfully', async () => {
const mockFormData = new FormData();
mockFormData.append('email', 'test@example.com');
mockFormData.append('password', 'validPassword123');

const mockEvent = {
request: {
formData: vi.fn().mockResolvedValue(mockFormData)
},
cookies: {
set: vi.fn()
}
};

const result = await actions.register(mockEvent as any);

expect(validateEmail).toHaveBeenCalledWith('test@example.com');
expect(validatePassword).toHaveBeenCalledWith('validPassword123');
expect(generateUserId).toHaveBeenCalled();
expect(db.insert).toHaveBeenCalled();
expect(auth.generateSessionToken).toHaveBeenCalled();
expect(auth.createSession).toHaveBeenCalledWith('mock-token', 'mock-user-id');
expect(auth.setSessionTokenCookie).toHaveBeenCalled();
expect(EmailService).toHaveBeenCalled();
expect(languageAwareRedirect).toHaveBeenCalledWith(302, '/');
expect(result).toEqual({ status: 302, location: '/' });
});

it('should fail with invalid email', async () => {
const mockFormData = new FormData();
mockFormData.append('email', 'invalid-email');
mockFormData.append('password', 'validPassword123');

const mockEvent = {
request: {
formData: vi.fn().mockResolvedValue(mockFormData)
}
};

vi.mocked(validateEmail).mockReturnValue(false);

const result = await actions.register(mockEvent as any);

expect(validateEmail).toHaveBeenCalledWith('invalid-email');
expect(result).toEqual({ status: 400, data: { message: 'Invalid email' } });
});

it('should fail with invalid password', async () => {
const mockFormData = new FormData();
mockFormData.append('email', 'test@example.com');
mockFormData.append('password', 'weak');

const mockEvent = {
request: {
formData: vi.fn().mockResolvedValue(mockFormData)
}
};

vi.mocked(validateEmail).mockReturnValue(true);
vi.mocked(validatePassword).mockReturnValue(false);

const result = await actions.register(mockEvent as any);

expect(validateEmail).toHaveBeenCalledWith('test@example.com');
expect(validatePassword).toHaveBeenCalledWith('weak');
expect(result).toEqual({ status: 400, data: { message: 'Invalid password' } });
});

it('should handle database errors', async () => {
const mockFormData = new FormData();
mockFormData.append('email', 'test@example.com');
mockFormData.append('password', 'validPassword123');

const mockEvent = {
request: {
formData: vi.fn().mockResolvedValue(mockFormData)
}
};

vi.mocked(validateEmail).mockReturnValue(true);
vi.mocked(validatePassword).mockReturnValue(true);
vi.mocked(db.insert).mockReturnValue({
values: vi.fn().mockRejectedValue(new Error('Database error'))
});

const result = await actions.register(mockEvent as any);

expect(result).toEqual({ status: 500, data: { message: 'An error occurred during registration' } });
});

it('should handle email sending errors', async () => {
const mockFormData = new FormData();
mockFormData.append('email', 'test@example.com');
mockFormData.append('password', 'validPassword123');

const mockEvent = {
request: {
formData: vi.fn().mockResolvedValue(mockFormData)
},
cookies: {
set: vi.fn()
}
};

vi.mocked(validateEmail).mockReturnValue(true);
vi.mocked(validatePassword).mockReturnValue(true);
vi.mocked(db.insert).mockReturnValue({
values: vi.fn().mockResolvedValue([{ id: 'mock-id' }])
});

vi.mocked(EmailService).mockImplementation(() => ({
sendWelcomeEmail: vi.fn().mockRejectedValue(new Error('Email sending error'))
}));

const result = await actions.register(mockEvent as any);

expect(result).toEqual({ status: 500, data: { message: 'Failed to send welcome email' } });
});
});
});