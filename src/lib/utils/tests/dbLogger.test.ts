import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logToDB } from '$lib/utils/dbLogger'; // Angenommen, die Funktion ist in dieser Datei
import { db } from '$lib/server/db';
import { logs } from '$lib/server/db/schema';

// Mock der Datenbankoperationen
vi.mock('$lib/server/db', () => ({
	db: {
		insert: vi.fn().mockReturnValue({
			values: vi.fn().mockResolvedValue(undefined)
		})
	}
}));

// Mock für console.error
vi.spyOn(console, 'error').mockImplementation(() => {});
describe('logToDB', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should insert a log entry into the database', async () => {
		const level = 'info';
		const message = 'Test log message';
		const metadata = { key: 'value' };

		await logToDB(level, message, metadata);

		expect(vi.mocked(db.insert).mock.calls[0][0]).toBe(logs);
		expect(vi.mocked(db.insert(logs).values).mock.calls[0][0]).toEqual({
			level,
			message,
			metadata
		});
	});

	it('should use an empty object as default metadata', async () => {
		const level = 'warn';
		const message = 'Test log message without metadata';

		await logToDB(level, message);

		expect(vi.mocked(db.insert).mock.calls[0][0]).toBe(logs);
		expect(vi.mocked(db.insert(logs).values).mock.calls[0][0]).toEqual({
			level,
			message,
			metadata: {}
		});
	});

	it('should log to console.error if database insertion fails', async () => {
		const error = new Error('Database error');
		vi.mocked(db.insert(logs).values).mockRejectedValueOnce(error);

		const level = 'error';
		const message = 'Test error log';

		await logToDB(level, message);

		expect(console.error).toHaveBeenCalledWith('Failed to log to database:', error);
	});
});
