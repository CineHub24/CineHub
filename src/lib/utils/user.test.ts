import { describe, it, expect, vi } from 'vitest';
import { validateEmail, validatePassword, generateUserId } from '$lib/utils/user';
import * as encoding from '@oslojs/encoding';

// Mock für @oslojs/encoding
vi.mock('@oslojs/encoding', () => ({
encodeBase32LowerCase: vi.fn((bytes) => 'mockedEncodedId')
}));

describe('validateEmail', () => {
it('should return true for valid email addresses', () => {
expect(validateEmail('test@example.com')).toBe(true);
expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
expect(validateEmail('x@example.com')).toBe(true);
});

it('should return false for invalid email addresses', () => {
expect(validateEmail('invalid')).toBe(false);
expect(validateEmail('invalid@')).toBe(false);
expect(validateEmail('@invalid.com')).toBe(false);
expect(validateEmail('inv alid@example.com')).toBe(false);
expect(validateEmail('')).toBe(false);
expect(validateEmail('a'.repeat(255) + '@example.com')).toBe(false);
});

it('should return false for non-string inputs', () => {
expect(validateEmail(null)).toBe(false);
expect(validateEmail(undefined)).toBe(false);
expect(validateEmail(123)).toBe(false);
expect(validateEmail({})).toBe(false);
});
});

describe('validatePassword', () => {
it('should return true for valid passwords', () => {
expect(validatePassword('ValidP@ss1')).toBe(true);
expect(validatePassword('C0mpl3x!P@ssw0rd')).toBe(true);
});

it('should return false for passwords that are too short', () => {
expect(validatePassword('Short1!')).toBe(false);
});

it('should return false for passwords that are too long', () => {
expect(validatePassword('a'.repeat(256) + 'A1!')).toBe(false);
});

it('should return false for passwords without uppercase letters', () => {
expect(validatePassword('nouppercase1!')).toBe(false);
});

it('should return false for passwords without lowercase letters', () => {
expect(validatePassword('NOLOWERCASE1!')).toBe(false);
});

it('should return false for passwords without numbers', () => {
expect(validatePassword('NoNumbers!')).toBe(false);
});

it('should return false for passwords without special characters', () => {
expect(validatePassword('NoSpecialChars1')).toBe(false);
});

it('should return false for non-string inputs', () => {
expect(validatePassword(null)).toBe(false);
expect(validatePassword(undefined)).toBe(false);
expect(validatePassword(123)).toBe(false);
expect(validatePassword({})).toBe(false);
});
});

describe('generateUserId', () => {
it('should generate a user ID', () => {
// Mock crypto.getRandomValues
const mockGetRandomValues = vi.fn((array) => {
for (let i = 0; i < array.length; i++) {
array[i] = i;
}
return array;
});

// Save the original crypto object
const originalCrypto = global.crypto;

// Replace global.crypto with our mock
Object.defineProperty(global, 'crypto', {
value: { getRandomValues: mockGetRandomValues },
configurable: true
});

try {
const userId = generateUserId();
expect(userId).toBe('mockedEncodedId');
expect(mockGetRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
expect(encoding.encodeBase32LowerCase).toHaveBeenCalledWith(expect.any(Uint8Array));
} finally {
// Restore the original crypto object
Object.defineProperty(global, 'crypto', {
value: originalCrypto,
configurable: true
});
}
});
});