import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import { ticketType } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PgInsertBuilder } from 'drizzle-orm/pg-core';

const filledFormData = {
	get: (key: string) => {
		if (key === 'name') {
			return 'Adult';
		} else if (key === 'factor') {
			return '1.0';
		} else if (key === 'description') {
			return 'Standard adult ticket';
		} else if (key === 'id') {
			return '1';
		} else {
			return null;
		}
	}
};

const emptyFormData = {
	get: () => null
};

// Mock the database
vi.mock('$lib/server/db', () => {
	const mockExecute = vi.fn().mockResolvedValue({});
	const mockValues = vi.fn().mockReturnValue({ execute: mockExecute });
	const mockInsert = vi.fn().mockReturnValue({
		values: mockValues,
		execute: mockExecute
	}) as unknown as PgInsertBuilder<any, any>;

	return {
		db: {
			select: vi.fn(() => ({
				from: vi.fn().mockResolvedValue([])
			})),
			insert: mockInsert,
			delete: vi.fn(() => ({
				where: vi.fn().mockResolvedValue({})
			})),
			update: vi.fn(() => ({
				set: vi.fn(() => ({
					where: vi.fn().mockResolvedValue({})
				}))
			}))
		}
	};
});

// Mock error function
vi.mock('@sveltejs/kit', () => ({
	error: vi.fn((status, message) => {
		throw { status, message };
	})
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
				url: new URL('http://localhost')
			}) as unknown as RequestEvent;

		describe('createTicketType', () => {
			it('should create a new ticket type', async () => {
				const result = await actions.createTicketType(mockRequestEvent(filledFormData));

				expect(db.insert).toHaveBeenCalledWith(ticketType);
				expect(db.insert(ticketType).values).toHaveBeenCalledWith({
					name: 'Adult',
					factor: '1.0',
					description: 'Standard adult ticket'
				});
				expect(result).toBeUndefined();
			});

			it('should handle errors when creating a ticket type', async () => {
				vi.mocked(db.insert).mockImplementationOnce(
					() =>
						({
							values: vi.fn().mockReturnValue({
								execute: vi.fn().mockRejectedValue(new Error('Database error'))
							})
						}) as unknown as PgInsertBuilder<any, any>
				);

				await expect(actions.createTicketType(mockRequestEvent(filledFormData))).rejects.toEqual({
					status: 500,
					message: 'Error creating the priceSet'
				});
			});
		});

		describe('deleteTicketType', () => {
			it('should delete a ticket type with a valid id', async () => {
				const result = await actions.deleteTicketType(mockRequestEvent(filledFormData));

				expect(db.delete).toHaveBeenCalledWith(ticketType);
				expect(result).toBeUndefined();
			});

			it('should handle errors when deleting a ticket type', async () => {
				vi.mocked(db.delete).mockImplementationOnce(() => {
					throw new Error('Database error');
				});

				const consoleLogSpy = vi.spyOn(console, 'log');
				await actions.deleteTicketType(mockRequestEvent(filledFormData));
				expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('error'));
			});
		});

		describe('updateTicketType', () => {
			it('should update a ticket type', async () => {
				const result = await actions.updateTicketType(mockRequestEvent(filledFormData));

				expect(db.update).toHaveBeenCalledWith(ticketType);
				expect(result).toBeUndefined();
			});

			it('should handle missing inputs', async () => {
				await expect(actions.updateTicketType(mockRequestEvent(emptyFormData))).rejects.toEqual({
					status: 400,
					message: 'Missing inputs'
				});
			});

			it('should handle errors when updating a ticket type', async () => {
				vi.mocked(db.update).mockImplementationOnce(() => {
					throw new Error('Database error');
				});

				await expect(actions.updateTicketType(mockRequestEvent(filledFormData))).rejects.toEqual({
					status: 500,
					message: 'Error updating price set'
				});
			});
		});
	});
});
