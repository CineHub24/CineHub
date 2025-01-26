import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server'; // Stellen Sie sicher, dass dieser Pfad korrekt ist
import { db } from '$lib/server/db';
import { EmailService } from '$lib/utils/emailService';
import * as languageAwareModule from '$lib/utils/languageAware';
import { fail, type Redirect } from '@sveltejs/kit';

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn()
	}
}));

vi.mock('$lib/utils/emailService', () => ({
	EmailService: vi.fn()
}));

vi.mock('$lib/utils/languageAware', () => ({
	languageAwareRedirect: vi.fn()
}));

vi.mock('@sveltejs/kit', async () => {
	const actual = await vi.importActual('@sveltejs/kit');
	return {
		...actual,
		fail: (status: number, data: any) => ({ status, data })
	};
});

describe('load function', () => {
	const mockLocals = {
		user: { id: 1, email: 'test@example.com' }
	};
	const mockUrl = {
		searchParams: {
			get: vi.fn()
		}
	};
	const mockParams = { id: '123' };

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return user data, tickets, booking, and used gift codes when booking is completed', async () => {
		const mockBookingCompleted = { status: 'completed' };
		const mockTicketsWithDetails = [{ ticketId: 1, movieTitle: 'Test Movie' }];
		const mockUsedGiftCodes = [{ id: 1, amount: 10, description: 'Test Gift Code' }];

		vi.mocked(db.select).mockImplementationOnce(
			() =>
				({
					from: vi.fn().mockReturnThis(),
					where: vi.fn().mockResolvedValue([mockBookingCompleted])
				}) as any
		);

		vi.mocked(db.select).mockImplementationOnce(
			() =>
				({
					from: vi.fn().mockReturnThis(),
					leftJoin: vi.fn().mockReturnThis(),
					where: vi.fn().mockResolvedValue(mockTicketsWithDetails)
				}) as any
		);

		vi.mocked(db.select).mockImplementationOnce(
			() =>
				({
					from: vi.fn().mockReturnThis(),
					innerJoin: vi.fn().mockReturnThis(),
					where: vi.fn().mockResolvedValue(mockUsedGiftCodes)
				}) as any
		);

		const result = await load({ locals: mockLocals, url: mockUrl, params: mockParams } as any);

		expect(result).toEqual({
			user: mockLocals.user,
			tickets: mockTicketsWithDetails,
			booking: mockBookingCompleted,
			usedGiftCodes: mockUsedGiftCodes
		});
	});


	it('should return a 500 error when database query fails', async () => {
		vi.mocked(db.select).mockImplementationOnce(
			() =>
				({
					from: vi.fn().mockReturnThis(),
					where: vi.fn().mockRejectedValue(new Error('Database error'))
				}) as any
		);

		const result = await load({ locals: mockLocals, url: mockUrl, params: mockParams } as any);

		expect(result).toEqual({
			status: 500,
			data: { error: 'Internal Server Error DB' }
		});
	});

	it('should return a 401 error when user is not authenticated', async () => {
		const result = await load({ locals: {}, url: mockUrl, params: mockParams } as any);

		expect(result).toEqual({
			status: 401,
			data: { error: 'Unauthorized' }
		});
	});
});
