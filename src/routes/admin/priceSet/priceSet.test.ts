import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import { priceSet, seatCategory, ticketType } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

const filledFormData = {
	get: (key: string) => {
		if (key === 'name') {
			return 'Price Set';
		} else if (key === 'priceFactor') {
			return '1.5';
		} else if (key === 'id') {
			return '1';
		} else {
			return null;
		}
	},
	getAll: (key: string) => {
		if (key === 'seatCategoryPrices') {
			return ['1', '2'];
		} else if (key === 'ticketTypes') {
			return ['1', '2'];
		} else {
			return null;
		}
	}
};
const emptyFormData = {
	get: () => null,
	getAll: () => []
};

// Mock the database
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				orderBy: vi.fn().mockResolvedValue([])
			}))
		})),
		insert: vi.fn(() => ({
			values: vi.fn().mockResolvedValue({})
		})),
		delete: vi.fn(() => ({
			where: vi.fn().mockResolvedValue({})
		})),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn().mockResolvedValue({})
			}))
		}))
	}
}));

// Mock both error and fail functions
vi.mock('@sveltejs/kit', () => {
	return {
		error: vi.fn((status, message) => {
			throw { status, message };
		}),
		fail: vi.fn((status, data) => {
			return { status, data };
		})
	};
});

describe('page.server.ts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load function', () => {
		it('should return price sets, seat categories, and ticket types', async () => {
			const result = await load({ url: new URL('http://localhost') } as any);

			expect(db.select).toHaveBeenCalledTimes(3);
			expect(result).toEqual({
				priceSets: [],
				seatCategories: [],
				ticketTypes: []
			});
		});

		it('should handle errors', async () => {
			vi.mocked(db.select).mockImplementationOnce(() => {
				throw new Error('Database error');
			});

			await expect(load({ url: new URL('http://localhost') } as any)).rejects.toEqual({
				status: 500,
				message: 'Internal Server Error DB'
			});

			expect(error).toHaveBeenCalledWith(500, 'Internal Server Error DB');
		});
	});

	describe('actions', () => {
		const mockRequestEvent = (formData: any): RequestEvent =>
			({
				request: {
					formData: () => Promise.resolve(formData)
				},
				url: new URL('http://localhost'),
				params: {},
				route: { id: '' },
				isDataRequest: false,
				getClientAddress: () => '',
				locals: {},
				platform: {},
				setHeaders: () => {},
				cookies: {
					get: () => '',
					set: () => {},
					delete: () => {},
					serialize: () => ''
				},
				fetch: () => Promise.resolve(new Response())
			}) as unknown as RequestEvent;

		describe('createPriceSet', () => {
			it('should create a new price set', async () => {
				const result = await actions.createPriceSet(mockRequestEvent(filledFormData));

				expect(db.insert).toHaveBeenCalledWith(priceSet);
				expect(result).toBeUndefined();
			});

			it('should handle missing inputs', async () => {
				const result = await actions.createPriceSet(mockRequestEvent(emptyFormData));
				expect(result).toEqual({ status: 400, data: { message: 'Missing inputs' } });
			});
		});

		describe('delete', () => {
			// it('should delete a price set with a valid id', async () => {
			// 	const result = await actions.delete(mockRequestEvent(filledFormData));

			// 	expect(db.delete).toHaveBeenCalledWith(priceSet);
			// 	expect(result).toBeUndefined();
			// });
			it('should delete a price set with a valid id', async () => {
				const priceSetData: typeof priceSet.$inferInsert = {
					id: 1,
					name: 'Price Set',
					priceFactor: '1.5',
					seatCategoryPrices: [1, 2],
					ticketTypes: [1, 2]
				};
				await db.insert(priceSet).values(priceSetData);
                console.log(db.select().from(priceSet));

				const result = await actions.delete(mockRequestEvent(filledFormData));

				expect(db.delete).toHaveBeenCalledWith(priceSet);
				expect(db.delete(priceSet).where).toHaveBeenCalledWith(eq(priceSet.id, 1));
				expect(result).toBeUndefined();
			});

			it('should return a 400 error if the priceSetId is missing', async () => {
				const requestEvent = mockRequestEvent(emptyFormData);

				const result = await actions.delete(requestEvent);

				expect(result).toEqual({ status: 400, data: { message: 'Missing inputs' } });
				expect(fail).toHaveBeenCalledWith(400, { message: 'Missing inputs' });
			});
		});

		describe('updatePriceSet', () => {
			it('should update a price set', async () => {
				const result = await actions.updatePriceSet(mockRequestEvent(filledFormData));

				expect(db.update).toHaveBeenCalledWith(priceSet);
				expect(result).toBeUndefined();
			});

			it('should handle missing inputs', async () => {
				const result = await actions.updatePriceSet(mockRequestEvent(emptyFormData));

				expect(result).toEqual({ status: 400, data: { message: 'Missing inputs' } });
				expect(fail).toHaveBeenCalledWith(400, { message: 'Missing inputs' });
			});
		});
	});
});
