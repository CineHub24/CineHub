import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import * as dbModule from '$lib/server/db';
import { logs } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

// Mock the entire db module
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis()
	}
}));

// Mock fail function
vi.mock('@sveltejs/kit', () => ({
	fail: vi.fn((status, data) => ({ status, data }))
}));

describe('load function', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return log entries when successful', async () => {
		const mockLogs = [
			{ id: 1, message: 'Log 1', createdAt: new Date() },
			{ id: 2, message: 'Log 2', createdAt: new Date() }
		];

		const mockDb = dbModule.db as any;
		mockDb.limit.mockResolvedValue(mockLogs);

		const result = await load({} as any);

		expect(mockDb.select).toHaveBeenCalled();
		expect(mockDb.from).toHaveBeenCalledWith(logs);
		expect(mockDb.limit).toHaveBeenCalledWith(100);
		expect(result).toEqual({
			logs: mockLogs
		});
	});

	it('should handle empty result', async () => {
		const mockDb = dbModule.db as any;
		mockDb.limit.mockResolvedValue([]);

		const result = await load({} as any);

		expect(mockDb.select).toHaveBeenCalled();
		expect(mockDb.from).toHaveBeenCalledWith(logs);
		expect(mockDb.limit).toHaveBeenCalledWith(100);
		expect(result).toEqual({
			logs: []
		});
	});

	it('should handle database errors', async () => {
		const mockDb = dbModule.db as any;
		mockDb.limit.mockRejectedValue(new Error('Database error'));

		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

		try {
			await load({} as any);
		} catch (error) {
			// The error is expected, so we catch it here
		}

		expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

		const loggedError = consoleSpy.mock.calls[0][0];
		expect(loggedError.message).toBe('Database error');

		expect(fail).toHaveBeenCalledWith(500, { error: m.internal_server_error({}) });

		consoleSpy.mockRestore();
	});
});