import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import { cinema, type Cinema } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// Mock drizzle-orm
vi.mock('drizzle-orm', async () => {
	const actual = await vi.importActual('drizzle-orm');
	return {
		...actual,
		eq: vi.fn(),
		sql: vi.fn()
	};
});

// Mock the database
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn()
			}))
		})),
		update: vi.fn()
	}
}));

describe('load function', () => {
	it('should return the correct cinema', async () => {
		const mockCinema: Cinema = {
			id: 1,
			name: 'Test Cinema',
			address: 'Test Address',
			opentime: '09:00',
			closeTime: '22:00',
			numScreens: 10
		};

		// Mock the select query result
		const mockSelectResult = [
			{
				id: 1,
				name: 'Test Cinema',
				address: 'Test Address',
				opentime: '09:00',
				closeTime: '22:00',
				numScreens: 10
			}
		];

		// Setup the mock chain
		const mockWhere = vi.fn().mockResolvedValue(mockSelectResult);
		const mockFrom = vi.fn(() => ({ where: mockWhere }));
		const mockSelect = vi.fn(() => ({ from: mockFrom }));
		(db.select as any).mockImplementation(mockSelect);

		const result = await load({ url: new URL('http://example.com/cinema/1') } as any);

		expect(result).toEqual({ cinema: mockCinema });
		expect(mockSelect).toHaveBeenCalled();
		expect(mockFrom).toHaveBeenCalledWith(cinema);
		expect(mockWhere).toHaveBeenCalledWith(eq(cinema.id, 1));
	});
});

describe('update action', () => {
	let mockRequest: Request;
	let mockSet: any;
	let mockWhere: any;

	beforeEach(() => {
		mockRequest = {
			formData: vi.fn().mockResolvedValue(
				new Map([
					['id', '1'],
					['name', 'Updated Cinema'],
					['adress', '123 Main St'],
					['opening_time', '09:00'],
					['closing_time', '22:00']
				])
			)
		} as unknown as Request;

		mockWhere = vi.fn().mockResolvedValue({ rowCount: 1 });
		mockSet = vi.fn(() => ({ where: mockWhere }));
		(db.update as any).mockReturnValue({ set: mockSet });
	});

	it('should update cinema successfully', async () => {
		const result = await actions.update({ request: mockRequest } as RequestEvent);

		expect(result).toEqual({ success: 'Cinema successfully updated!' });
		expect(db.update).toHaveBeenCalledWith(cinema);
		expect(mockSet).toHaveBeenCalledWith({
			name: 'Updated Cinema',
			address: '123 Main St',
			opentime: '09:00',
			closeTime: '22:00'
		});
		expect(mockWhere).toHaveBeenCalledWith(eq(cinema.id, 1));
	});

	it('should handle closing time of 00:00', async () => {
		mockRequest.formData = vi.fn().mockResolvedValue(
			new Map([
				['id', '1'],
				['name', 'Updated Cinema'],
				['adress', '123 Main St'],
				['opening_time', '09:00'],
				['closing_time', '00:00']
			])
		);

		const result = await actions.update({ request: mockRequest } as RequestEvent);

		expect(result).toEqual({ success: 'Cinema successfully updated!' });
		expect(mockSet).toHaveBeenCalledWith({
			name: 'Updated Cinema',
			address: '123 Main St',
			opentime: '09:00',
			closeTime: '24:00'
		});
	});

	it('should fail if closing time is before opening time', async () => {
		mockRequest.formData = vi.fn().mockResolvedValue(
			new Map([
				['id', '1'],
				['name', 'Updated Cinema'],
				['adress', '123 Main St'],
				['opening_time', '09:00'],
				['closing_time', '08:00']
			])
		);

		const result = await actions.update({ request: mockRequest } as RequestEvent);

		expect(result).toEqual(fail(400, { error: 'Closing time must be after opening time' }));
	});

	it('should handle server error', async () => {
		mockWhere.mockRejectedValue(new Error('Database error'));

		const result = await actions.update({ request: mockRequest } as RequestEvent);

		expect(result).toEqual(fail(500, { error: 'Server error while updating cinema' }));
	});
});
