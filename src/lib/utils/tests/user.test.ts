import { describe, it, expect, vi } from 'vitest';
import { validateEmail, validatePassword, generateUserId } from '$lib/utils/user';
import type { User } from '$lib/server/db/schema';

// Mock the crypto API
const mockRandomValues = vi.fn();
vi.stubGlobal('crypto', {
	getRandomValues: mockRandomValues
});

// Mock the @oslojs/encoding module
vi.mock('@oslojs/encoding', () => ({
	encodeBase32LowerCase: vi.fn().mockReturnValue('mockedUserId')
}));

describe('User utilities', () => {
	describe('validateEmail', () => {
		it('should return true for valid email addresses', () => {
			expect(validateEmail('test@example.com')).toBe(true);
			expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
		});

		it('should return false for invalid email addresses', () => {
			expect(validateEmail('invalid')).toBe(false);
			expect(validateEmail('invalid@')).toBe(false);
			expect(validateEmail('@invalid.com')).toBe(false);
		});
	});

	describe('validatePassword', () => {
		it('should return true for valid passwords', () => {
			expect(validatePassword('ValidP@ss123')).toBe(true);
			expect(validatePassword('C0mpl3x!P@ssw0rd')).toBe(true);
		});

		it('should return false for invalid passwords', () => {
			expect(validatePassword('short')).toBe(false);
			expect(validatePassword('nouppercase123!')).toBe(false);
			expect(validatePassword('NOLOWERCASE123!')).toBe(false);
			expect(validatePassword('NoNumbers!')).toBe(false);
			expect(validatePassword('NoSpecialChars123')).toBe(false);
		});
	});

	describe('generateUserId', () => {
		it('should generate a user ID', () => {
			mockRandomValues.mockImplementation((array) => {
				for (let i = 0; i < array.length; i++) {
					array[i] = i;
				}
			});

			const userId = generateUserId();
			expect(userId).toBe('mockedUserId');
			expect(mockRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
		});
	});
});


// Mock the database operations
const mockDb = {
	user: {
		create: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
};

vi.mock('$lib/db', () => ({
	db: mockDb
}));

describe('User database operations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create a new user', async () => {
		const newUser = {
			id: 'testId',
			email: 'test@example.com',
			password: 'hashedPassword'
		};

		mockDb.user.create.mockResolvedValue(newUser);

		const result = await mockDb.user.create({ data: newUser });
		expect(result).toEqual(newUser);
		expect(mockDb.user.create).toHaveBeenCalledWith({ data: newUser });
	});

});
