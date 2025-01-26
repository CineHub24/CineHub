import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getFreeTimeSlots,
	calculateTimeDifference,
	calculateEndTime,
	conflictingShowings
} from '$lib/utils/timeSlots';
import { db } from '$lib/server/db';
import { showing } from '$lib/server/db/schema';

// Mock the db module
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(),
		from: vi.fn(),
		where: vi.fn(),
		orderBy: vi.fn()
	}
}));

describe('Cinema Functions', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('getFreeTimeSlots', () => {
		it('should return free time slots', async () => {
			// Mock existing showings
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue([
							{ time: '10:00', endTime: '12:00' },
							{ time: '14:00', endTime: '16:00' }
						])
					})
				})
			} as any);

			const freeSlots = await getFreeTimeSlots(db, 1, 1, '2023-06-01', 120);

			expect(freeSlots.length).toBeGreaterThan(0);
			expect(freeSlots[0]).toHaveProperty('start');
			expect(freeSlots[0]).toHaveProperty('end');
		});
	});

	describe('calculateTimeDifference', () => {
		it('should calculate time difference correctly', () => {
			const diff = calculateTimeDifference('10:00', '12:30');
			expect(diff).toBe(150);
		});
	});

	describe('calculateEndTime', () => {
		it('should calculate end time correctly', () => {
			const endTime = calculateEndTime('10:00', 120);
			expect(endTime).toBe('12:00');
		});
	});

	describe('conflictingShowings', () => {
		it('should return conflicting showings', async () => {
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ time: '10:00', endTime: '12:00' }])
				})
			} as any);

			const conflicts = await conflictingShowings(1, '2023-06-01', '11:00', '13:00');

			expect(conflicts.length).toBe(1);
			expect(conflicts[0]).toHaveProperty('time', '10:00');
		});
	});
});
