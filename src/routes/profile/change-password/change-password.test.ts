import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { fail } from '@sveltejs/kit';
import { validatePassword } from '$lib/utils/user.js';
import { hash, verify } from 'argon2';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn().mockReturnThis(),
from: vi.fn().mockReturnThis(),
where: vi.fn().mockReturnThis(),
update: vi.fn().mockReturnThis(),
set: vi.fn().mockReturnThis(),
}
}));

vi.mock('$lib/utils/languageAware', () => ({
languageAwareRedirect: vi.fn()
}));

vi.mock('$lib/utils/user.js', () => ({
validatePassword: vi.fn()
}));

vi.mock('argon2', () => ({
hash: vi.fn(),
verify: vi.fn()
}));

describe('Profile Page', () => {
beforeEach(() => {
vi.clearAllMocks();
});

describe('load function', () => {
it('should redirect to login if user is not authenticated', async () => {
const event = { locals: { user: null } };
await load(event as any);
expect(languageAwareRedirect).toHaveBeenCalledWith(301, '/login');
});

it('should return user data and password status for authenticated user', async () => {
const mockUser = { id: 'user1', password: 'hashedpassword' };
vi.mocked(db.select().from().where).mockResolvedValue([mockUser]);

const event = { locals: { user: mockUser } };
const result = await load(event as any);

expect(result).toEqual({
user: mockUser,
hasNoPassword: false
});
});
});

describe('changePassword action', () => {
it('should fail if user is not authenticated', async () => {
const event = { locals: { user: null, session: null } };
const result = await actions.changePassword(event as any);
expect(result).toEqual(fail(401, { error: 'Unauthorized' }));
});

it('should fail if new passwords do not match', async () => {
const mockUser = { id: 'user1', password: 'hashedpassword' };
vi.mocked(db.select().from().where).mockResolvedValue([mockUser]);

const event = {
locals: { user: mockUser, session: {} },
request: {
formData: vi.fn().mockResolvedValue(new Map([
['currentPassword', 'oldpass'],
['newPassword', 'newpass'],
['confirmPassword', 'differentpass']
]))
}
};

const result = await actions.changePassword(event as any);
expect(result).toEqual(fail(400, { error: 'Die neuen Passwörter stimmen nicht überein', mismatch: true }));
});

it('should fail if new password is invalid', async () => {
const mockUser = { id: 'user1', password: 'hashedpassword' };
vi.mocked(db.select().from().where).mockResolvedValue([mockUser]);
vi.mocked(validatePassword).mockReturnValue(false);

const event = {
locals: { user: mockUser, session: {} },
request: {
formData: vi.fn().mockResolvedValue(new Map([
['currentPassword', 'oldpass'],
['newPassword', 'newpass'],
['confirmPassword', 'newpass']
]))
}
};

const result = await actions.changePassword(event as any);
expect(result).toEqual(fail(400, {
error: 'Das neue Passwort muss Groß- & Kleinbuchstaben, Zahlen sowie Sonderzeichen enthalten und zwischen 8 und 255 Zeichen lang sein.',
invalid: true
}));
});

it('should successfully change password', async () => {
const mockUser = { id: 'user1', password: 'hashedpassword' };
vi.mocked(db.select().from().where).mockResolvedValue([mockUser]);
vi.mocked(validatePassword).mockReturnValue(true);
vi.mocked(verify).mockResolvedValue(true);
vi.mocked(hash).mockResolvedValue('newhashpassword');

const event = {
locals: { user: mockUser, session: {} },
request: {
formData: vi.fn().mockResolvedValue(new Map([
['currentPassword', 'oldpass'],
['newPassword', 'newpass'],
['confirmPassword', 'newpass']
]))
}
};

const result = await actions.changePassword(event as any);
expect(languageAwareRedirect).toHaveBeenCalledWith(303, '/profile?passwordChanged=true');
});
});
});