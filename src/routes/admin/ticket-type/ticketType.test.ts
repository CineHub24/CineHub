import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import { ticketType } from '$lib/server/db/schema';
import { error, fail } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

// Mock the database
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn().mockResolvedValue([])
		})),
		insert: vi.fn(() => ({
			values: vi.fn(() => ({
				execute: vi.fn().mockResolvedValue({})
			}))
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

// Mock @sveltejs/kit
vi.mock('@sveltejs/kit', async () => {
	const actual = (await vi.importActual('@sveltejs/kit')) as object;
	return {
		...actual,
		error: vi.fn((status, message) => {
			throw { status, message };
		}),
		fail: vi.fn((status, data) => ({ status, data }))
	};
});

// Mock messages
vi.mock('$lib/paraglide/messages.js', () => ({
	internal_server_error: vi.fn(() => 'Internal Server Error'),
	missing_inputs: vi.fn(() => 'Missing Inputs')
}));

describe('page.server.ts for Ticket Types', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load function', () => {
		it('should return ticket types', async () => {
			const result = await load({ url: new URL('http://localhost') } as any);

			expect(db.select).toHaveBeenCalledTimes(1);
			expect(result).toEqual({
				ticketTypes: []
			});
		});

		it('should handle errors', async () => {
			vi.mocked(db.select).mockImplementationOnce(() => {
				throw new Error('Database error');
			});

			const result = await load({ url: new URL('http://localhost') } as any);
			expect(result).toEqual({
				status: 500,
				data: { error: 'Internal Server Error' }
			});
		});
	});

	describe('actions', () => {
		const mockFormData = new FormData();
		mockFormData.append('id', '1');
		mockFormData.append('name', 'Adult');
		mockFormData.append('factor', '1.0');
		mockFormData.append('description', 'Standard adult ticket');

		const mockRequest = {
			formData: () => Promise.resolve(mockFormData)
		};

		describe('createTicketType', () => {
			it('should create a new ticket type', async () => {
				const result = await actions.createTicketType({ request: mockRequest } as any);

				expect(db.insert).toHaveBeenCalledWith(ticketType);
				expect(result).toBeUndefined();
			});

			it('should handle errors when creating a ticket type', async () => {
				vi.mocked(db.insert).mockImplementationOnce(() => {
					throw new Error('Database error');
				});

				const result = await actions.createTicketType({ request: mockRequest } as any);
				expect(result).toEqual({
					status: 500,
					data: { error: 'Internal Server Error' }
				});
			});
		});

		describe('deleteTicketType', () => {
			it('should delete a ticket type with a valid id', async () => {
				const result = await actions.deleteTicketType({ request: mockRequest } as any);

				expect(db.delete).toHaveBeenCalledWith(ticketType);
				expect(result).toBeUndefined();
			});

			it('should handle errors when deleting a ticket type', async () => {
				vi.mocked(db.delete).mockImplementationOnce(() => {
					throw new Error('Database error');
				});

				const result = await actions.deleteTicketType({ request: mockRequest } as any);
				expect(result).toEqual({
					status: 500,
					data: { error: 'Internal Server Error' }
				});
			});
		});

		describe('updateTicketType', () => {
			it('should update a ticket type', async () => {
				const result = await actions.updateTicketType({ request: mockRequest } as any);

				expect(db.update).toHaveBeenCalledWith(ticketType);
				expect(result).toBeUndefined();
			});

			it('should handle missing inputs', async () => {
				const emptyFormData = new FormData();
				const emptyRequest = {
					formData: () => Promise.resolve(emptyFormData)
				};

				const result = await actions.updateTicketType({ request: emptyRequest } as any);
				expect(result).toEqual({
					status: 400,
					data: { message: 'Missing Inputs' }
				});
			});

			it('should handle errors when updating a ticket type', async () => {
				vi.mocked(db.update).mockImplementationOnce(() => {
					throw new Error('Database error');
				});

				const result = await actions.updateTicketType({ request: mockRequest } as any);
				expect(result).toEqual({
					status: 500,
					data: { error: 'Internal Server Error' }
				});
			});
		});
	});
});
