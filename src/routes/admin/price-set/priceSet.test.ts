import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import * as dbModule from '$lib/server/db';
import { priceSet, seatCategory, ticketType } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';
import { eq } from 'drizzle-orm';

// Mock the entire db module
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis()
	}
}));

// Mock fail function
vi.mock('@sveltejs/kit', () => ({
	fail: vi.fn((status, data) => ({ status, data }))
}));

// Mock eq function
vi.mock('drizzle-orm', async () => {
	const actual = await vi.importActual('drizzle-orm');
	return {
		...actual,
		eq: vi.fn().mockImplementation((a, b) => ({ [Symbol('op')]: 'eq', left: a, right: b }))
	};
});

describe('load function', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return price sets, seat categories, and ticket types', async () => {
		const mockPriceSets = [{ id: 1, name: 'Price Set 1' }];
		const mockSeatCategories = [{ id: 1, name: 'Category 1', price: 100 }];
		const mockTicketTypes = [{ id: 1, name: 'Type 1' }];

		const mockDb = dbModule.db as any;
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.orderBy.mockImplementation(() => Promise.resolve(mockPriceSets));
		mockDb.from
			.mockImplementationOnce(() => ({ orderBy: () => Promise.resolve(mockPriceSets) }))
			.mockImplementationOnce(() => ({ orderBy: () => Promise.resolve(mockSeatCategories) }))
			.mockImplementationOnce(() => ({ orderBy: () => Promise.resolve(mockTicketTypes) }));

		const result = await load({ url: {} } as any);

		expect(result).toEqual({
			priceSets: mockPriceSets,
			seatCategories: mockSeatCategories,
			ticketTypes: mockTicketTypes
		});
	});

	it('should handle database errors', async () => {
		const mockDb = dbModule.db as any;
		mockDb.from.mockImplementation(() => {
			throw new Error('Database error');
		});

		await expect(load({ url: {} } as any)).rejects.toThrow('Database error');
	});
});

describe('actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createPriceSet', () => {
		it('should create a new price set', async () => {
			const mockRequest = {
				formData: vi.fn().mockResolvedValue({
					get: (key: string) => (key === 'name' ? 'New Price Set' : '1.5'),
					getAll: () => ['1', '2']
				})
			};

			const mockValues = vi.fn().mockResolvedValue({});
			(dbModule.db.insert as jest.Mock).mockReturnValue({
				values: mockValues
			});

			const result = await actions.createPriceSet({ request: mockRequest } as any);

			expect(dbModule.db.insert).toHaveBeenCalledWith(priceSet);
			expect(mockValues).toHaveBeenCalledWith({
				name: 'New Price Set',
				priceFactor: '1.5',
				seatCategoryPrices: [1, 2],
				ticketTypes: [1, 2]
			});
			expect(result).toBeUndefined();
		});

		it('should handle missing inputs', async () => {
			const mockRequest = {
				formData: vi.fn().mockResolvedValue({
					get: () => null,
					getAll: () => []
				})
			};

			const result = await actions.createPriceSet({ request: mockRequest } as any);

			expect(fail).toHaveBeenCalledWith(400, { message: m.missing_inputs });
			expect(result).toEqual({ status: 400, data: { message: m.missing_inputs } });
		});

		it('should handle database errors', async () => {
			const mockRequest = {
				formData: vi.fn().mockResolvedValue({
					get: (key: string) => (key === 'name' ? 'New Price Set' : '1.5'),
					getAll: () => ['1', '2']
				})
			};

			const mockValues = vi.fn().mockRejectedValue(new Error('Database error'));
			(dbModule.db.insert as jest.Mock).mockReturnValue({
				values: mockValues
			});

			const result = await actions.createPriceSet({ request: mockRequest } as any);

			expect(fail).toHaveBeenCalledWith(500, { message: m.error_creating_price_set });
			expect(result).toEqual({ status: 500, data: { message: m.error_creating_price_set } });
		});
	});

	describe('delete', () => {
		it('should delete a price set', async () => {
			const mockRequest = {
				formData: vi.fn().mockResolvedValue({
					get: () => '1'
				})
			};

			const mockWhere = vi.fn().mockResolvedValue({});
			(dbModule.db.delete as jest.Mock).mockReturnValue({
				where: mockWhere
			});

			const result = await actions.delete({ request: mockRequest } as any);

			expect(dbModule.db.delete).toHaveBeenCalledWith(priceSet);
			expect(eq).toHaveBeenCalledWith(priceSet.id, '1');
			expect(mockWhere).toHaveBeenCalledWith(
				expect.objectContaining({
					[Symbol('op')]: 'eq',
					left: priceSet.id,
					right: '1'
				})
			);
			expect(result).toBeUndefined();
		});

		it('should handle missing id', async () => {
			const mockRequest = {
				formData: vi.fn().mockResolvedValue({
					get: () => null
				})
			};

			const result = await actions.delete({ request: mockRequest } as any);

			expect(fail).toHaveBeenCalledWith(400, { message: m.missing_inputs });
			expect(result).toEqual({ status: 400, data: { message: m.missing_inputs } });
		});

		it('should handle database errors', async () => {
			const mockRequest = {
				formData: vi.fn().mockResolvedValue({
					get: () => '1'
				})
			};

			const mockWhere = vi.fn().mockRejectedValue(new Error('Database error'));
			(dbModule.db.delete as jest.Mock).mockReturnValue({
				where: mockWhere
			});

			const result = await actions.delete({ request: mockRequest } as any);

			expect(fail).toHaveBeenCalledWith(500, { message: m.error_deleting_price_set });
			expect(result).toEqual({ status: 500, data: { message: m.error_deleting_price_set } });
		});
	});

	describe('updatePriceSet', () => {
		it('should update a price set', async () => {
			const mockRequest = {
				formData: vi.fn().mockResolvedValue({
					get: (key: string) => {
						if (key === 'priceSetId') return '1';
						if (key === 'name') return 'Updated Price Set';
						if (key === 'priceFactor') return '2.0';
						return null;
					},
					getAll: () => ['1', '2']
				})
			};

			const mockSet = vi.fn().mockReturnThis();
			const mockWhere = vi.fn().mockResolvedValue({});
			(dbModule.db.update as jest.Mock).mockReturnValue({
				set: mockSet,
				where: mockWhere
			});

			const result = await actions.updatePriceSet({ request: mockRequest } as any);

			expect(dbModule.db.update).toHaveBeenCalledWith(priceSet);
			expect(mockSet).toHaveBeenCalledWith({
				name: 'Updated Price Set',
				priceFactor: '2.0',
				seatCategoryPrices: [1, 2],
				ticketTypes: [1, 2]
			});
			expect(eq).toHaveBeenCalledWith(priceSet.id, '1');
			expect(mockWhere).toHaveBeenCalledWith(
				expect.objectContaining({
					[Symbol('op')]: 'eq',
					left: priceSet.id,
					right: '1'
				})
			);
			expect(result).toBeUndefined();
		});

		it('should handle missing inputs', async () => {
			const mockRequest = {
				formData: vi.fn().mockResolvedValue({
					get: () => null,
					getAll: () => []
				})
			};

			const result = await actions.updatePriceSet({ request: mockRequest } as any);

			expect(fail).toHaveBeenCalledWith(400, { message: m.missing_inputs });
			expect(result).toEqual({ status: 400, data: { message: m.missing_inputs } });
		});

		it('should handle database errors', async () => {
			const mockRequest = {
				formData: vi.fn().mockResolvedValue({
					get: (key: string) => {
						if (key === 'priceSetId') return '1';
						if (key === 'name') return 'Updated Price Set';
						if (key === 'priceFactor') return '2.0';
						return null;
					},
					getAll: () => ['1', '2']
				})
			};

			const mockSet = vi.fn().mockReturnThis();
			const mockWhere = vi.fn().mockRejectedValue(new Error('Database error'));
			(dbModule.db.update as jest.Mock).mockReturnValue({
				set: mockSet,
				where: mockWhere
			});

			const result = await actions.updatePriceSet({ request: mockRequest } as any);

			expect(fail).toHaveBeenCalledWith(500, { message: m.error_updating_price_set });
			expect(result).toEqual({ status: 500, data: { message: m.error_updating_price_set } });
		});
	});
});
