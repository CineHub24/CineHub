import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { fail } from '@sveltejs/kit';
import { verify } from 'argon2';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { validatePassword, validateEmail } from '$lib/utils/user';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { user } from '$lib/server/db/schema';

// Mocks
vi.mock('@sveltejs/kit', async () => {
	const actual = await vi.importActual('@sveltejs/kit');
	return {
		...actual,
		fail: vi.fn((status, data) => ({ status, data }))
	};
});

vi.mock('argon2', () => ({
	verify: vi.fn()
}));

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn()
			}))
		}))
	}
}));

vi.mock('$lib/server/auth', () => ({
	generateSessionToken: vi.fn(),
	createSession: vi.fn(),
	setSessionTokenCookie: vi.fn()
}));

vi.mock('$lib/utils/user', () => ({
	validatePassword: vi.fn(),
	validateEmail: vi.fn()
}));

vi.mock('$lib/utils/languageAware', () => ({
	languageAwareRedirect: vi.fn()
}));

describe('Login Page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load function', () => {
		it('should redirect if user is already logged in', async () => {
			const event = { locals: { user: { id: '123' } } };
			vi.mocked(languageAwareRedirect).mockReturnValue({ status: 302, location: '/' });

			const result = await load(event as any);

			expect(languageAwareRedirect).toHaveBeenCalledWith(302, '/');
			expect(result).toEqual({ status: 302, location: '/' });
		});

		it('should return empty object if user is not logged in', async () => {
			const event = { locals: {} };

			const result = await load(event as any);

			expect(result).toEqual({});
		});
	});

	describe('actions', () => {
		describe('login', () => {
			it('should fail if email is invalid', async () => {
				const formData = new FormData();
				formData.append('email', 'invalid-email');
				formData.append('password', 'password123');
				const event = { request: { formData: () => Promise.resolve(formData) } };

				vi.mocked(validateEmail).mockReturnValue(false);

				const result = await actions.login(event as any);

				expect(result).toEqual(fail(400, { message: 'Invalid email' }));
			});

			it('should fail if password is invalid', async () => {
				const formData = new FormData();
				formData.append('email', 'valid@email.com');
				formData.append('password', 'weak');
				const event = { request: { formData: () => Promise.resolve(formData) } };

				vi.mocked(validateEmail).mockReturnValue(true);
				vi.mocked(validatePassword).mockReturnValue(false);

				const result = await actions.login(event as any);

				expect(result).toEqual(fail(400, { message: 'Invalid password' }));
			});

			it('should fail if user does not exist', async () => {
				const formData = new FormData();
				formData.append('email', 'nonexistent@email.com');
				formData.append('password', 'password123');
				const event = { request: { formData: () => Promise.resolve(formData) } };

				vi.mocked(validateEmail).mockReturnValue(true);
				vi.mocked(validatePassword).mockReturnValue(true);
				vi.mocked(db.select().from(user).where).mockResolvedValue([]);

				const result = await actions.login(event as any);

				expect(result).toEqual(fail(400, { message: 'Incorrect username or password' }));
			});

			it('should fail if password is incorrect', async () => {
				const formData = new FormData();
				formData.append('email', 'existing@email.com');
				formData.append('password', 'wrongpassword');
				const event = { request: { formData: () => Promise.resolve(formData) } };

				vi.mocked(validateEmail).mockReturnValue(true);
				vi.mocked(validatePassword).mockReturnValue(true);
				vi.mocked(db.select().from(user).where).mockResolvedValue([
					{
                        id: '123', password: 'hashedpassword',
                        googleId: null,
                        githubId: null,
                        lastName: null,
                        firstName: null,
                        address: null,
                        email: null,
                        role: 'user'
                    }
				]);
				vi.mocked(verify).mockResolvedValue(false);

				const result = await actions.login(event as any);

				expect(result).toEqual(fail(400, { message: 'Incorrect username or password' }));
			});
		

			it('should fail with internal server error on unexpected error', async () => {
				const formData = new FormData();
				formData.append('email', 'existing@email.com');
				formData.append('password', 'correctpassword');
				const event = { request: { formData: () => Promise.resolve(formData) } };

				vi.mocked(validateEmail).mockReturnValue(true);
				vi.mocked(validatePassword).mockReturnValue(true);
				vi.mocked(db.select().from(user).where).mockRejectedValue(new Error('Database error'));

				const result = await actions.login(event as any);

				expect(result).toEqual(fail(400, { message: 'Incorrect username or password' }));
			});
		});
	});
});
