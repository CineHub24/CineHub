import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logToDB, LogLevel } from '$lib/utils/dbLogger';
import { db } from '$lib/server/db';
import { logs } from '$lib/server/db/schema';

vi.mock('$lib/server/db', () => ({
	db: {
		insert: vi.fn(() => ({
			values: vi.fn()
		}))
	}
}));

describe('logToDB function', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should log message to database with correct data', async () => {
		vi.mocked(db.insert).mockReturnValue({
			values: vi.fn().mockResolvedValue([])
		} as any);
		const mockEvent = {
			url: new URL('http://example.com/test'),
			request: { method: 'GET' },
			locals: { user: { email: 'test@example.com', role: 'user' } },
			route: { id: '/test' },
			params: { id: '123' }
		};

		await logToDB(LogLevel.INFO, 'Test message', mockEvent as any);

		expect(db.insert).toHaveBeenCalledWith(logs);
		expect(db.insert(logs).values).toHaveBeenCalledWith({
			level: LogLevel.INFO,
			message: 'Test message - User: test@example.com - Role: user - Route: /test',
			metadata: expect.any(String)
		});
	});

	it('should handle missing user information', async () => {
		vi.mocked(db.insert).mockReturnValue({
			values: vi.fn().mockResolvedValue([])
		} as any);
		const mockEvent = {
			url: new URL('http://example.com/test'),
			request: { method: 'POST' },
			locals: {},
			route: { id: '/test' },
			params: {}
		};

		await logToDB(LogLevel.WARN, 'Warning message', mockEvent as any);

		expect(db.insert).toHaveBeenCalledWith(logs);
		expect(db.insert(logs).values).toHaveBeenCalledWith({
			level: LogLevel.WARN,
			message: 'Warning message - User: unknown user - Role: unknown role - Route: /test',
			metadata: expect.any(String)
		});
	});

	it('should handle database insertion error', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.mocked(db.insert).mockRejectedValueOnce(new Error('DB Error'));

		const mockEvent = {
			url: new URL('http://example.com/test'),
			request: { method: 'GET' },
			locals: {},
			route: { id: '/test' },
			params: {}
		};

		await logToDB(LogLevel.ERROR, 'Error message', mockEvent as any);

		expect(consoleSpy).toHaveBeenCalledWith('Failed to log to database:', expect.any(Error));
		consoleSpy.mockRestore();
	});
});
