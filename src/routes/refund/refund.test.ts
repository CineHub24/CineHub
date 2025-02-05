import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ticket, priceDiscount, ticketStatusEnum, discountTypesEnum } from '$lib/server/db/schema';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { generateUniqueCode } from '$lib/utils/randomCode';
import * as m from '$lib/paraglide/messages';

// Mocks
vi.mock('$lib/server/db', () => {
	const mockDb = {
		selectDistinct: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		innerJoin: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		groupBy: vi.fn().mockResolvedValue([]),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockResolvedValue([{ code: 'ABC123' }])
	};
	return { db: mockDb };
});

vi.mock('$lib/utils/languageAware', () => ({
	languageAwareRedirect: vi.fn()
}));

vi.mock('$lib/utils/randomCode', () => ({
	generateUniqueCode: vi.fn()
}));

vi.mock('$lib/paraglide/messages', () => ({
	internal_server_error: vi.fn(() => 'Internal server error'),
	missing_inputs: vi.fn(() => 'Missing inputs'),
	discount_code_created: vi.fn(() => 'Discount code created')
}));

describe('Refund Page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load function', () => {
		it('should redirect if user is not logged in', async () => {
			const event = { locals: {} };
			vi.mocked(languageAwareRedirect).mockReturnValue({ status: 301, location: '/login' });

			const result = await load(event as any);

			expect(languageAwareRedirect).toHaveBeenCalledWith(301, '/login');
			expect(result).toEqual({ status: 301, location: '/login' });
		});

		it('should return refundable shows if user is logged in', async () => {
			const event = { locals: { user: { id: '123' } } };
			const mockRefundableShows = [{ showId: 1, filmTitle: 'Test Movie' }];
			vi.mocked(db.selectDistinct).mockReturnValue(db);
			vi.mocked(db.groupBy).mockResolvedValue(mockRefundableShows);

			const result = await load(event as any);

			expect(result).toEqual({ refundableShows: mockRefundableShows });
		});
	});

	describe('actions', () => {
		describe('bookNew action', () => {
			beforeEach(() => {
				vi.resetAllMocks();
			});

			it('should create a new discount and update ticket status', async () => {
				const mockRequest = {
					formData: vi.fn().mockResolvedValue({
						get: vi.fn().mockReturnValue('100'),
						getAll: vi.fn().mockReturnValue([1, 2, 3])
					})
				};

				vi.mocked(generateUniqueCode).mockResolvedValue('ABC123');

				vi.mocked(db.insert).mockReturnValue({
					values: vi.fn().mockReturnThis(),
					returning: vi.fn().mockResolvedValue([{ code: 'ABC123' }])
				});

				vi.mocked(db.update).mockReturnValue({
					set: vi.fn().mockReturnThis(),
					where: vi.fn().mockResolvedValue(undefined)
				});

				const result = await actions.bookNew({ request: mockRequest });

				expect(result).toEqual({
					code: 'ABC123',
					newCodeCreated: true,
					message: m.discount_code_created({})
				});

				expect(db.insert).toHaveBeenCalledWith(priceDiscount);
				expect(db.update).toHaveBeenCalledWith(ticket);
			});

			it('should return fail when refundAmount is missing', async () => {
				const mockRequest = {
					formData: vi.fn().mockResolvedValue({
						get: vi.fn().mockReturnValue(null),
						getAll: vi.fn().mockReturnValue([1, 2, 3])
					})
				};

				const result = await actions.bookNew({ request: mockRequest });

				expect(result).toEqual(fail(400, { message: m.missing_inputs({}), missing: true }));
			});

			it('should return dbFail on database error', async () => {
				const mockRequest = {
					formData: vi.fn().mockResolvedValue({
						get: vi.fn().mockReturnValue('100'),
						getAll: vi.fn().mockReturnValue([1, 2, 3])
					})
				};

				vi.mocked(generateUniqueCode).mockResolvedValue('ABC123');

				vi.mocked(db.insert).mockImplementation(() => {
					throw new Error('Database error');
				});

				const result = await actions.bookNew({ request: mockRequest });

				expect(result).toEqual(fail(500, { message: 'Internal server error', database: true }));
			});
		});
	});
});
