import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server'; // Passen Sie den Pfad an
import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import * as emailServiceModule from '$lib/utils/emailService.js';
import { validatePassword } from '$lib/utils/user.js';
import { hash } from 'argon2';
import * as m from '$lib/paraglide/messages.js';

// Mocks
vi.mock('$lib/server/db', () => {
const mockDb = {
select: vi.fn(),
insert: vi.fn(),
update: vi.fn(),
delete: vi.fn(),
};
mockDb.select.mockReturnValue(mockDb);
mockDb.insert.mockReturnValue(mockDb);
mockDb.update.mockReturnValue(mockDb);
mockDb.delete.mockReturnValue(mockDb);
return { db: mockDb };
});

vi.mock('$lib/utils/emailService.js', () => ({
EmailService: vi.fn(() => ({
sendResetPasswordEmail: vi.fn(),
})),
}));

vi.mock('$lib/utils/user.js', () => ({
validatePassword: vi.fn(),
}));

vi.mock('argon2', () => ({
hash: vi.fn(),
}));

vi.mock('@sveltejs/kit', async () => {
const actual = await vi.importActual('@sveltejs/kit');
return {
...actual,
fail: vi.fn((status, data) => ({ status, data })),
};
});

describe('Reset Password Page', () => {
let mockEmailService: { sendResetPasswordEmail: vi.Mock };

beforeEach(() => {
vi.clearAllMocks();
mockEmailService = {
sendResetPasswordEmail: vi.fn(),
};
vi.mocked(emailServiceModule.EmailService).mockImplementation(() => mockEmailService as any);
});

describe('load function', () => {
it('should return hasToken true when token is present', async () => {
const url = new URL('http://example.com?token=123');
const result = await load({ url });
expect(result).toEqual({ hasToken: true, token: '123' });
});

it('should return hasToken false when token is not present', async () => {
const url = new URL('http://example.com');
const result = await load({ url });
expect(result).toEqual({ hasToken: false });
});
});

describe('actions', () => {
describe('resetPassword', () => {
it('should send reset password email when user exists', async () => {
const formData = new FormData();
formData.append('email', 'test@example.com');
const mockRequest = { formData: () => Promise.resolve(formData) };

vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([{ id: '123' }]),
}),
} as any);

vi.mocked(db.insert).mockReturnValue({
values: vi.fn().mockReturnValue({
returning: vi.fn().mockResolvedValue([{ token: 'reset-token' }]),
}),
} as any);

const result = await actions.resetPassword({ request: mockRequest as any });

expect(result).toEqual({ success: 'Email was sent to Email: test@example.com' });
expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalledWith('reset-token', 'test@example.com');
});

it('should return success message even when user does not exist', async () => {
const formData = new FormData();
formData.append('email', 'nonexistent@example.com');
const mockRequest = { formData: () => Promise.resolve(formData) };

vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([]),
}),
} as any);

const result = await actions.resetPassword({ request: mockRequest as any });

expect(result).toEqual({ success: 'Email was sent to Email: nonexistent@example.com' });
expect(mockEmailService.sendResetPasswordEmail).not.toHaveBeenCalled();
});

it('should return fail when there is a database error', async () => {
const formData = new FormData();
formData.append('email', 'test@example.com');
const mockRequest = { formData: () => Promise.resolve(formData) };

vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockRejectedValue(new Error('Database error')),
}),
} as any);

const result = await actions.resetPassword({ request: mockRequest as any });

expect(result).toEqual(fail(500, { error: 'Error while reseting password' }));
});
});

describe('setNewPassword', () => {
it('should change password when token is valid', async () => {
const formData = new FormData();
formData.append('token', 'valid-token');
formData.append('password', 'newPassword123');
formData.append('confirmPassword', 'newPassword123');
const mockRequest = { formData: () => Promise.resolve(formData) };

vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([{ userId: '123' }]),
}),
} as any);

vi.mocked(validatePassword).mockReturnValue(true);
vi.mocked(hash).mockResolvedValue('hashed-password');

vi.mocked(db.update).mockReturnValue({
set: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([]),
}),
} as any);

vi.mocked(db.delete).mockReturnValue({
where: vi.fn().mockResolvedValue([]),
} as any);

const result = await actions.setNewPassword({ request: mockRequest as any, url: {} as any });

expect(result).toEqual({ success: 'Password has been changed' });
expect(db.update).toHaveBeenCalled();
expect(db.delete).toHaveBeenCalled();
});

it('should fail when passwords do not match', async () => {
const formData = new FormData();
formData.append('token', 'valid-token');
formData.append('password', 'password1');
formData.append('confirmPassword', 'password2');
const mockRequest = { formData: () => Promise.resolve(formData) };

const result = await actions.setNewPassword({ request: mockRequest as any, url: {} as any });

expect(result).toEqual(fail(400, { error: 'Passwords do not match' }));
});

it('should fail when password is invalid', async () => {
const formData = new FormData();
formData.append('token', 'valid-token');
formData.append('password', 'weak');
formData.append('confirmPassword', 'weak');
const mockRequest = { formData: () => Promise.resolve(formData) };

vi.mocked(validatePassword).mockReturnValue(false);

const result = await actions.setNewPassword({ request: mockRequest as any, url: {} as any });

expect(result).toEqual(fail(400, { error: m.password_requirements({}) }));
});

it('should fail when token is invalid', async () => {
const formData = new FormData();
formData.append('token', 'invalid-token');
formData.append('password', 'newPassword123');
formData.append('confirmPassword', 'newPassword123');
const mockRequest = { formData: () => Promise.resolve(formData) };

vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([]),
}),
} as any);

vi.mocked(validatePassword).mockReturnValue(true);

const result = await actions.setNewPassword({ request: mockRequest as any, url: {} as any });

expect(result).toEqual(fail(400, { error: 'Invalid token' }));
});

it('should fail when there is a database error', async () => {
const formData = new FormData();
formData.append('token', 'valid-token');
formData.append('password', 'newPassword123');
formData.append('confirmPassword', 'newPassword123');
const mockRequest = { formData: () => Promise.resolve(formData) };

vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockRejectedValue(new Error('Database error')),
}),
} as any);

vi.mocked(validatePassword).mockReturnValue(true);

const result = await actions.setNewPassword({ request: mockRequest as any, url: {} as any });

expect(result).toEqual(fail(500, { error: 'Error while setting new password' }));
});
});
});
});