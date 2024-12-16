import { validateEmail, validatePassword, generateUserId } from './user';

import { describe, it, expect } from 'vitest';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag+sorting@example.com')).toBe(true);
    expect(validateEmail('email@subdomain.example.com')).toBe(true);
  });

  it('should invalidate incorrect email addresses', () => {
    expect(validateEmail('plainaddress')).toBe(false);
    expect(validateEmail('@missingusername.com')).toBe(false);
    expect(validateEmail('username@.com')).toBe(false);
    expect(validateEmail('username@domain..com')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
    expect(validateEmail(12345)).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should validate correct passwords', () => {
    expect(validatePassword('abcdef')).toBe(true);
    expect(validatePassword('123456')).toBe(true);
    expect(validatePassword('aVerySecurePassword123!')).toBe(true);
  });

  it('should invalidate incorrect passwords', () => {
    expect(validatePassword('')).toBe(false);
    expect(validatePassword('short')).toBe(false);
    expect(validatePassword('a'.repeat(256))).toBe(false);
    expect(validatePassword(null)).toBe(false);
    expect(validatePassword(undefined)).toBe(false);
    expect(validatePassword(123456)).toBe(false);
  });
});

describe('generateUserId', () => {
  it('should generate a valid Base32 ID of expected length', () => {
    const id = generateUserId();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(24); // Base32 encoded 15 bytes = ~24 characters
    expect(/^[a-z2-7]+$/.test(id)).toBe(true); // Base32 lower-case validation
  });

  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 1000 }, generateUserId));
    expect(ids.size).toBe(1000); // All generated IDs should be unique
  });
});
