import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import { priceSet, seatCategory, ticketType } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

// Mock the database
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				orderBy: vi.fn()
			}))
		})),
		insert: vi.fn(() => ({
			values: vi.fn()
		})),
		delete: vi.fn(() => ({
			where: vi.fn()
		})),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn()
			}))
		}))
	}
}));

// Mock messages
vi.mock('$lib/paraglide/messages.js', () => ({
	invalid_factor: vi.fn(() => 'Invalid factor'),
	error_creating_price_set: 'Error creating price set',
	missing_inputs: vi.fn(() => 'Missing inputs'),
	error_deleting_price_set: 'Error deleting price set',
	no_empty_array: vi.fn(() => 'No empty array'),
	error_updating_price_set: vi.fn(() => 'Error updating price set')
}));

describe('load function', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return priceSets, seatCategories, and ticketTypes', async () => {
		const mockPriceSets = [{ id: 1, name: 'Standard' }];
		const mockSeatCategories = [{ id: 1, name: 'VIP', price: 100, isActive: true }];
		const mockTicketTypes = [{ id: 1, name: 'Adult' }];

		vi.mocked(db.select).mockImplementation(
			() =>
				({
					from: vi.fn().mockImplementation((table) => ({
						where: vi.fn().mockImplementation(() => ({
							orderBy: vi
								.fn()
								.mockResolvedValue(
									table === priceSet
										? mockPriceSets
										: table === seatCategory
											? mockSeatCategories.filter((category) => category.isActive === true)
											: mockTicketTypes
								)
						})),
						orderBy: vi
							.fn()
							.mockResolvedValue(
								table === priceSet
									? mockPriceSets
									: table === seatCategory
										? mockSeatCategories
										: mockTicketTypes
							)
					}))
				}) as any
		);

		const result = await load({ url: new URL('http://localhost/') });

		expect(result).toEqual({
			priceSets: mockPriceSets,
			seatCategories: mockSeatCategories,
			ticketTypes: mockTicketTypes
		});
	});
});

describe('actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createPriceSet', () => {
		it('should create a new price set successfully', async () => {
			const mockFormData = {
				get: vi.fn((key) => (key === 'name' ? 'New Set' : '1.5')),
				getAll: vi.fn(() => ['[{"value":1}]'])
			};

			const request = { formData: vi.fn().mockResolvedValue(mockFormData) };

			await actions.createPriceSet({ request } as any);

			expect(db.insert).toHaveBeenCalledWith(priceSet);
		});

		it('should return fail for invalid price factor', async () => {
			const mockFormData = {
				get: vi.fn((key) => (key === 'name' ? 'New Set' : '-1')),
				getAll: vi.fn(() => ['[{"value":1}]'])
			};

			const request = { formData: vi.fn().mockResolvedValue(mockFormData) };

			const mockInvalidFactor = 'Mock invalid factor message';
			vi.mocked(m.invalid_factor).mockReturnValue(mockInvalidFactor);

			const result = await actions.createPriceSet({ request } as any);

			expect(result).toEqual(fail(400, { message: mockInvalidFactor }));
			expect(m.invalid_factor).toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		it('should delete a price set successfully', async () => {
			const mockFormData = {
				get: vi.fn(() => '1')
			};

			const request = { formData: vi.fn().mockResolvedValue(mockFormData) };

			await actions.delete({ request } as any);

			expect(db.delete).toHaveBeenCalledWith(priceSet);
		});

		it('should return fail for missing id', async () => {
			const mockFormData = {
				get: vi.fn(() => null)
			};

			const request = { formData: vi.fn().mockResolvedValue(mockFormData) };

			const mockMissingInputs = m.missing_inputs({});
			vi.mocked(m.missing_inputs).mockReturnValue(mockMissingInputs);

			const result = await actions.delete({ request } as any);

			expect(result).toEqual(fail(400, { message: m.missing_inputs({}) }));
			expect(m.missing_inputs).toHaveBeenCalled();
		});
	});

	describe('updatePriceSet', () => {
		it('should update a price set successfully', async () => {
			const mockFormData = {
				get: vi.fn((key) => {
					if (key === 'priceSetId') return '1';
					if (key === 'name') return 'Updated Set';
					if (key === 'priceFactor') return '2.0';
					return null;
				}),
				getAll: vi.fn(() => ['[{"value":1}]'])
			};

			const request = { formData: vi.fn().mockResolvedValue(mockFormData) };

			await actions.updatePriceSet({ request } as any);

			expect(db.update).toHaveBeenCalledWith(priceSet);
		});

		it('should return fail for missing inputs', async () => {
			const mockFormData = {
				get: vi.fn(() => null),
				getAll: vi.fn(() => ['[{"value":1}]'])
			};

			const request = { formData: vi.fn().mockResolvedValue(mockFormData) };

			const mockMissingInputs = 'Mock missing inputs message';
			vi.mocked(m.missing_inputs).mockReturnValue(mockMissingInputs);

			const result = await actions.updatePriceSet({ request } as any);

			expect(result).toEqual(fail(400, { message: mockMissingInputs, missing: true }));
			expect(m.missing_inputs).toHaveBeenCalled();
		});

		it('should return fail for empty arrays', async () => {
			const mockFormData = {
				get: vi.fn((key) => {
					if (key === 'priceSetId') return '1';
					if (key === 'name') return 'Updated Set';
					if (key === 'priceFactor') return '2.0';
					return null;
				}),
				getAll: vi.fn(() => ['[]'])
			};

			const request = { formData: vi.fn().mockResolvedValue(mockFormData) };

			const mockNoEmptyArray = 'Mock no empty array message';
			vi.mocked(m.no_empty_array).mockReturnValue(mockNoEmptyArray);

			const result = await actions.updatePriceSet({ request } as any);

			expect(result).toEqual(fail(400, { message: mockNoEmptyArray, empty: true }));
			expect(m.no_empty_array).toHaveBeenCalled();
		});

		it('should return fail for invalid price factor', async () => {
			const mockFormData = {
				get: vi.fn((key) => {
					if (key === 'priceSetId') return '1';
					if (key === 'name') return 'Updated Set';
					if (key === 'priceFactor') return '-1.0';
					return null;
				}),
				getAll: vi.fn(() => ['[{"value":1}]'])
			};

			const request = { formData: vi.fn().mockResolvedValue(mockFormData) };

			const mockInvalidFactor = 'Mock invalid factor message';
			vi.mocked(m.invalid_factor).mockReturnValue(mockInvalidFactor);

			const result = await actions.updatePriceSet({ request } as any);

			expect(result).toEqual(fail(400, { message: mockInvalidFactor }));
			expect(m.invalid_factor).toHaveBeenCalled();
		});
	});
});
