import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '$lib/server/db';
import { actions } from './show/[id]/+page.server';
import type {
	Showing,
	Seat,
	Film,
	Booking,
	PriceSet,
	Cinema,
	CinemaHall,
	Discount,
	GiftCode,
	PriceDiscount,
	SeatCategory,
	Session,
	Ticket,
	TicketType,
	User
} from '$lib/server/db/schema';
import { ticket } from '$lib/server/db/schema';
import { type Stripe } from '@stripe/stripe-js';
import { EmailService } from '$lib/utils/emailService';
import { and, eq, inArray, ne, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { notifySeatChange } from '$lib/server/sse';
import { LogLevel, logToDB } from '$lib/utils/dbLogger';

// Mock der Dependencies
vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					innerJoin: vi.fn(() => ({
						where: vi.fn()
					}))
				}))
			}))
		})),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn()
			}))
		})),
		delete: vi.fn(() => ({
			where: vi.fn()
		})),
		insert: vi.fn(() => ({
			values: vi.fn()
		}))
	}
}));

vi.mock('@stripe/stripe-js', () => ({
	stripe: {
		checkout: {
			sessions: {
				create: vi.fn()
			}
		}
	}
}));

vi.mock('$lib/utils/emailService', () => ({
	EmailService: vi.fn().mockImplementation(() => ({
		sendBookingConfirmation: vi.fn()
	}))
}));
vi.mock('$lib/server/sse', () => ({
	notifySeatChange: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$lib/utils/dbLogger', () => {
	const LogLevel = {
		INFO: 'info',
		ERROR: 'error',
		WARNING: 'warning',
		DEBUG: 'debug'
	};

	return {
		logToDB: vi.fn().mockResolvedValue(undefined),
		LogLevel
	};
});

vi.mock('drizzle-orm', () => ({
	eq: vi.fn(),
	and: vi.fn(),
	inArray: vi.fn(),
	ne: vi.fn(),
	sql: vi.fn()
}));

describe('Booking Process Flow', () => {
	// Testdaten
	const mockShow: Showing = {
		id: 1,
		filmid: 1,
		hallid: 1,
		priceSetId: 1,
		date: '2022-01-01',
		time: '20:00',
		endTime: '22:30',
		language: 'de',
		dimension: '',
		cancelled: false,
		soldTickets: null
	};

	const mockSeat: Seat = {
		id: 1,
		seatNumber: 'A1',
		row: 'A',
		rotation: '0',
		top: '-104',
		left: '-147',
		cinemaHall: 1,
		categoryId: 1
	};
	const mockBooking = {
		date: '2022-01-01',
		id: 1,
		time: '20:00',
		status: 'cart',
		userId: '1'
	};

	const mockTicket: Ticket = {
		id: 1,
		bookingId: 1,
		showingId: 1,
		seatId: 1,
		status: 'reserved',
		type: 1,
		price: '12.00',
		createdAt: new Date(Date.now()),
		token: null
		// expiresAt: new Date(Date.now() + 15 * 60 * 1000)
	};

	const mockSeatCategory = {
		id: 1,
		name: 'Standard',
		price: '12.00',
		color: '#000000'
	};

	const mockPriceSet: PriceSet = {
		id: 1,
		name: 'Standard',
		ticketTypes: [1],
		seatCategoryPrices: [1],
		priceFactor: '1'
	};

	const mockTicketType = {
		id: 1,
		name: 'Standard',
		factor: '1'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should reserve a seat when clicking it', async () => {
		// Mock the necessary database queries
		vi.mocked(db.select)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				innerJoin: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockResolvedValue([])
			} as any)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				innerJoin: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([mockSeat])
			} as any)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				innerJoin: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([mockSeatCategory])
			} as any)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				innerJoin: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([mockShow])
			} as any)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				innerJoin: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([mockPriceSet])
			} as any)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				innerJoin: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([mockTicketType])
			} as any)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				innerJoin: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([mockBooking])
			} as any)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				innerJoin: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockResolvedValue([])
			} as any);

		vi.mocked(db.update).mockReturnValueOnce({
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockResolvedValue([mockBooking])
		} as any);
		// Mock the insert function
		vi.mocked(db.insert).mockReturnValueOnce({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([])
			})
		} as any);

		const mockFormData = {
			get: vi.fn((key) => {
				if (key === 'showingId') return mockShow.id;
				if (key === 'seatId') return mockSeat.id;
				if (key === 'ticketType') return 1;
				return null;
			})
		};
		const mockRequest = { formData: vi.fn().mockResolvedValue(mockFormData) };
		const mockLocals = { user: { id: 1 } };

		// Execute the action
		const result = await actions.reserveSeat({ request: mockRequest, locals: mockLocals } as any);

		// Check if the select function was called the correct number of times
		expect(db.select).toHaveBeenCalledTimes(8);

		// Assertions
		expect(result).toEqual({ success: true });
		expect(db.insert).toHaveBeenCalledTimes(1);
		expect(db.insert).toHaveBeenCalledWith(ticket);


		expect(db.insert(ticket).values).toHaveBeenCalledWith(
			expect.objectContaining({
				status: 'reserved',
				showingId: 1,
				bookingId: 1,
				seatId: 1,
				type: 1,
				price: '12.00',
			})
		);
	});

	//show/id reserveSeat und evtl bookSeats
	//cart load und discount
	//cart/checkout load
	//cart/checkout/verify load
	//booking/complete POST
	//booking/id load
});
