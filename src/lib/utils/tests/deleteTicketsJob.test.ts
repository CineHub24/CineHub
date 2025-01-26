import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteOldReservedTicketsJob } from '$lib/utils/jobs/deleteTicketsJob';
import { db } from '$lib/server/db';
import { ticket } from '$lib/server/db/schema';
import { notifySeatChange } from '$lib/server/sse';
import schedule from 'node-schedule';
import { and, eq, lt } from 'drizzle-orm';

// Mock the required modules
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn()
			}))
		})),
		delete: vi.fn(() => ({
			where: vi.fn()
		}))
	}
}));

vi.mock('$lib/server/sse', () => ({
	notifySeatChange: vi.fn()
}));

vi.mock('node-schedule', () => ({
	default: {
		scheduleJob: vi.fn((cronExpression, callback) => {
			callback();
			return { cancel: vi.fn() };
		})
	}
}));

describe('deleteOldReservedTicketsJob', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should schedule a job and delete old reserved tickets', async () => {
		const mockOldReservedTickets = [
			{ id: 1, showingId: 100 },
			{ id: 2, showingId: 101 }
		];

		const mockSelect = vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(mockOldReservedTickets)
			})
		});
		const mockDelete = vi.fn().mockReturnValue({
			where: vi.fn().mockResolvedValue(2)
		});

		vi.mocked(db.select).mockImplementation(mockSelect);
		vi.mocked(db.delete).mockImplementation(mockDelete);

		deleteOldReservedTicketsJob();

		expect(schedule.scheduleJob).toHaveBeenCalledWith('*/1 * * * *', expect.any(Function));

		// Execute the scheduled callback
		await (schedule.scheduleJob as any).mock.calls[0][1]();

		expect(mockSelect).toHaveBeenCalled();
		expect(mockSelect().from).toHaveBeenCalledWith(ticket);
		expect(mockSelect().from().where).toHaveBeenCalledWith(
			and(eq(ticket.status, 'reserved'), lt(ticket.createdAt, expect.any(Date)))
		);

		expect(mockDelete).toHaveBeenCalled();
		expect(mockDelete().where).toHaveBeenCalledWith(
			and(eq(ticket.status, 'reserved'), lt(ticket.createdAt, expect.any(Date)))
		);

		expect(notifySeatChange).toHaveBeenCalledTimes(2);
		expect(notifySeatChange).toHaveBeenCalledWith(100);
		expect(notifySeatChange).toHaveBeenCalledWith(101);
	});

	it('should handle errors gracefully', async () => {
		const mockError = new Error('Database error');
		const mockSelect = vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockRejectedValue(mockError)
			})
		});

		vi.mocked(db.select).mockImplementation(mockSelect);

		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		deleteOldReservedTicketsJob();

		// Execute the scheduled callback
		await (schedule.scheduleJob as any).mock.calls[0][1]();

		expect(consoleErrorSpy).not.toHaveBeenCalled();

		consoleErrorSpy.mockRestore();
	});
});
