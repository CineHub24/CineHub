import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateUniqueCode } from '$lib/utils/randomCode';
import { db } from '$lib/server/db';
import { priceDiscount } from '$lib/server/db/schema';

// Mock the db module
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(),
		from: vi.fn(),
		where: vi.fn()
	}
}));

describe('generateUniqueCode', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should generate a code of the specified length', async () => {
		// Mock the database query to always return an empty array (no existing codes)
		vi.mocked(db.select).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([])
			})
		} as any);

		const code = await generateUniqueCode(6);
		expect(code).toHaveLength(6);
		expect(code).toMatch(/^[A-Z0-9]+$/);
	});

	it('should retry if the generated code already exists', async () => {
		// Mock the database query to return an existing code on the first call, then an empty array
		vi.mocked(db.select)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ discountCode: 'ABCDEF' }])
				})
			} as any)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([])
				})
			} as any);

		const code = await generateUniqueCode(6);
		expect(code).toHaveLength(6);
		expect(code).not.toBe('ABCDEF');
		expect(db.select).toHaveBeenCalledTimes(2);
	});

});
