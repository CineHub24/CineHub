import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

// Mock the database and schema
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(),
		execute: vi.fn()
	}
}));

vi.mock('$lib/server/db/schema', () => ({
	cinema: { name: 'cinema_name' },
	film: {},
	showing: {},
	cinemaHall: {},
	ticket: {}
}));

vi.mock('drizzle-orm', () => ({
	and: vi.fn(),
	eq: vi.fn(),
	gte: vi.fn(),
	ne: vi.fn(),
	or: vi.fn(),
	sql: vi.fn(),
	desc: vi.fn(),
	asc: vi.fn()
}));

describe('load function', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return correct data structure', async () => {
		const mockEvent = {
			cookies: {
				get: vi.fn(() => null)
			}
		};

		// Erstelle eine Mock-Funktion, die Kettenaufrufe erlaubt
		const createChainableMock = (finalValue: any) => {
			const chainable: any = {
				from: vi.fn(() => chainable),
				innerJoin: vi.fn(() => chainable),
				where: vi.fn(() => chainable),
				orderBy: vi.fn(() => chainable),
				groupBy: vi.fn(() => chainable),
				limit: vi.fn(() => chainable),
				then: (callback: (value: any) => any) => callback(finalValue)
			};
			return chainable;
		};

		// Mock-Rückgabewerte für die Datenbankabfragen
		const mockSelect = vi.fn().mockImplementation(() => createChainableMock([{ id: '1', name: 'Cinema 1' }]));
		vi.mocked(db.select).mockImplementation(mockSelect);
		vi.mocked(db.execute).mockResolvedValue([{ month: '2023-01', ticket_count: 100 }] as any);

		// Reihenfolge der Aufrufe:
		// 1. Abfrage für preferredCinema (Cookie-Fallback)
		// 2. movies
		// 3. shows
		// 4. cinemaRevenue
		// 5. movieTicketSales
		// 6. summaryData
		// 7. occupancyRate
		// 8. cinemas (für den finalen cinemas Query)
		// 9. halls
		mockSelect
			.mockReturnValueOnce(createChainableMock([{ id: '1', name: 'Cinema 1' }])) // preferredCinema fallback
			.mockReturnValueOnce(createChainableMock([{ id: '1', title: 'Movie 1' }])) // movies
			.mockReturnValueOnce(createChainableMock([{ Showing: { id: '1', date: '2023-01-01' } }])) // shows
			.mockReturnValueOnce(createChainableMock([{ name: 'Cinema 1', revenue: 1000 }])) // cinemaRevenue
			.mockReturnValueOnce(createChainableMock([{ title: 'Movie 1', ticketsSold: 50 }])) // movieTicketSales
			.mockReturnValueOnce(createChainableMock([{ totalRevenue: 5000, ticketsSold: 500, avgTicketPrice: 10 }])) // summaryData
			.mockReturnValueOnce(createChainableMock([{ avgOccupancyRate: 75 }])) // occupancyRate
			.mockReturnValueOnce(createChainableMock([{ Cinema: { id: '1', name: 'Cinema 1' }, CinemaHall: { id: '1', name: 'Hall 1' } }])) // cinemas
			.mockReturnValueOnce(createChainableMock([{ id: '1', name: 'Cinema 1' }])); // halls

		const result = await load(mockEvent);

		expect(result).toEqual({
			cinemas: [
				{
					Cinema: { id: '1', name: 'Cinema 1' },
					CinemaHall: { id: '1', name: 'Hall 1' }
				}
			],
			halls: [{ id: '1', name: 'Cinema 1' }],
			movies: [{ id: '1', title: 'Movie 1' }],
			shows: [{ id: '1', date: '2023-01-01' }],
			monthlyTicketSales: [{ month: '2023-01', ticket_count: 100 }],
			cinemaRevenue: [{ name: 'Cinema 1', revenue: 1000 }],
			movieTicketSales: [{ title: 'Movie 1', ticketsSold: 50 }],
			summaryData: { totalRevenue: 5000, ticketsSold: 500, avgTicketPrice: 10 },
			occupancyRate: 75
		});

		// Prüfe, dass alle Datenbankaufrufe wie erwartet getätigt wurden (insgesamt 9 select-Aufrufe)
		expect(db.select).toHaveBeenCalledTimes(9);
		expect(db.execute).toHaveBeenCalledTimes(1);
	});
});
