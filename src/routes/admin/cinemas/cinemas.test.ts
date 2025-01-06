import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from '../../../routes/admin/cinemas/+page.server';
import { db } from '$lib/server/db';
import { cinema } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';

// Mock drizzle-orm
vi.mock('drizzle-orm', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		eq: vi.fn(),
		sql: vi.fn()
	};
});

// Mock the database
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn()
		})),
		delete: vi.fn(() => ({
			where: vi.fn()
		}))
	}
}));

describe('load function', () => {
	it('should return all cinemas', async () => {
		const mockCinemas = [
			{ id: 1, name: 'Cinema 1' },
			{ id: 2, name: 'Cinema 2' }
		];

		const mockFrom = vi.fn().mockResolvedValue(mockCinemas);
		(db.select as any).mockReturnValue({ from: mockFrom });

		const result = await load({} as any);

		expect(result).toEqual({ cinemas: mockCinemas });
		expect(db.select).toHaveBeenCalled();
		expect(mockFrom).toHaveBeenCalledWith(cinema);
	});
});

describe('delete action', () => {
	let mockRequest: Request;
	let mockWhere: any;

	beforeEach(() => {
		mockRequest = {
			formData: vi.fn().mockResolvedValue(new Map([['id', '1']]))
		} as unknown as Request;

		mockWhere = vi.fn();
		(db.delete as any).mockReturnValue({ where: mockWhere });
	});

	it('should delete cinema successfully', async () => {
		await actions.delete({ request: mockRequest } as RequestEvent);

		expect(db.delete).toHaveBeenCalledWith(cinema);
		expect(mockWhere).toHaveBeenCalled(); // We can't check the exact arguments due to mocking
	});

	it('should handle errors during deletion', async () => {
		const consoleLogSpy = vi.spyOn(console, 'log');
		mockWhere.mockRejectedValue(new Error('Database error'));

		await actions.delete({ request: mockRequest } as RequestEvent);

		expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
	});
});
