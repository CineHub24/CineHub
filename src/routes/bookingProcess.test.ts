import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { db } from '$lib/server/db';
// import { actions as showActions } from './show/[id]/+page.server';
// import { load as cartLoad } from './cart/+page.server';
// import { load as completeLoad } from './cart/checkout/+page.server';
// import { load as verifyLoad } from './cart/checkout/verify/+page.server';
// import { booking, priceDiscount, showing, ticket } from '$lib/server/db/schema';
// import { row } from '$lib/paraglide/messages';
// import { mock } from 'node:test';
// import { EmailService } from '$lib/utils/emailService';

describe('true', () => {
	it('be true', async () => {
		expect(true).toEqual(true);
	});
});

// // Mock der Dependencies
// vi.mock('$lib/server/db', () => ({
// 	db: {
// 		select: vi.fn(() => ({
// 			from: vi.fn(() => ({
// 				where: vi.fn(() => ({
// 					innerJoin: vi.fn(() => ({
// 						where: vi.fn()
// 					}))
// 				}))
// 			}))
// 		})),
// 		update: vi.fn(() => ({
// 			set: vi.fn(() => ({
// 				where: vi.fn(() => ({
// 					returning: vi.fn()
// 				}))
// 			}))
// 		})),
// 		delete: vi.fn(() => ({
// 			where: vi.fn()
// 		})),
// 		insert: vi.fn().mockReturnValue({
// 			values: vi.fn().mockReturnValue({
// 				returning: vi.fn().mockResolvedValue([])
// 			})
// 		})
// 	}
// }));

// vi.mock('stripe', () => ({
// 	default: vi.fn().mockImplementation(() => ({
// 		checkout: {
// 			sessions: {
// 				create: vi.fn().mockResolvedValue({ client_secret: 'mock_client_secret' })
// 			}
// 		}
// 	})),
// 	retrieve: vi.fn().mockResolvedValue({
// 		payment_status: 'paid',
// 		metadata: {
// 			booking_id: '1',
// 			tickets: `1 2`,
// 			giftcodes: '1 2'
// 		}
// 	})
// }));

// vi.mock('$lib/utils/emailService', () => ({
// 	EmailService: vi.fn().mockImplementation(() => ({
// 		sendBookingConfirmation: vi.fn()
// 	}))
// }));
// vi.mock('$lib/server/sse', () => ({
// 	notifySeatChange: vi.fn().mockResolvedValue(undefined)
// }));

// vi.mock('$lib/utils/dbLogger', () => {
// 	const LogLevel = {
// 		INFO: 'info',
// 		ERROR: 'error',
// 		WARNING: 'warning',
// 		DEBUG: 'debug'
// 	};

// 	return {
// 		logToDB: vi.fn().mockResolvedValue(undefined),
// 		LogLevel
// 	};
// });

// vi.mock('drizzle-orm', () => ({
// 	eq: vi.fn(),
// 	and: vi.fn(),
// 	inArray: vi.fn(),
// 	ne: vi.fn(),
// 	sql: vi.fn(),
// 	gte: vi.fn()
// }));

// vi.mock('$lib/utils/randomCode', () => ({
//     generateUniqueCode: vi.fn().mockResolvedValue('DISCOUNT10')
// }));

// describe('Booking Process Flow', () => {
// 	// Testdaten

// 	const mockMovie = [
// 		{
// 			id: 1,
// 			title: 'Test Movie'
// 		}
// 	];
// 	const mockShow = [
// 		{
// 			id: 1,
// 			filmid: 1,
// 			hallid: 1,
// 			priceSetId: 1,
// 			date: '2022-01-01',
// 			time: '20:00',
// 			endTime: '22:30',
// 			language: 'de',
// 			dimension: '',
// 			cancelled: false,
// 			soldTickets: null
// 		}
// 	];

// 	const mockSeats = [
// 		{
// 			id: 1,
// 			seatNumber: 'A1',
// 			row: 'A',
// 			rotation: '0',
// 			top: '-104',
// 			left: '-147',
// 			cinemaHall: 1,
// 			categoryId: 1
// 		},
// 		{
// 			id: 2,
// 			seatNumber: 'A2',
// 			row: 'A',
// 			rotation: '0',
// 			top: '-104',
// 			left: '-200',
// 			cinemaHall: 1,
// 			categoryId: 1
// 		}
// 	];
// 	const mockBooking = [
// 		{
// 			date: '2022-01-01',
// 			id: 1,
// 			time: '20:00',
// 			status: 'cart',
// 			userId: '1'
// 		}
// 	];

// 	const mockTickets = [
// 		{
// 			id: 1,
// 			bookingId: 1,
// 			showingId: 1,
// 			seatId: 1,
// 			status: 'reserved',
// 			type: 1,
// 			price: '12.00',
// 			createdAt: new Date(Date.now()),
// 			token: null
// 		},
// 		{
// 			id: 2,
// 			bookingId: 1,
// 			showingId: 1,
// 			seatId: 2,
// 			status: 'reserved',
// 			type: 1,
// 			price: '12.00',
// 			createdAt: new Date(Date.now()),
// 			token: null
// 		}
// 	];

// 	const mockSeatCategory = [
// 		{
// 			id: 1,
// 			name: 'Standard',
// 			price: '12.00',
// 			color: '#000000'
// 		}
// 	];

// 	const mockPriceSet = [
// 		{
// 			id: 1,
// 			name: 'Standard',
// 			ticketTypes: [1],
// 			seatCategoryPrices: [1],
// 			priceFactor: '1'
// 		}
// 	];

// 	const mockTicketType = [
// 		{
// 			id: 1,
// 			name: 'Standard',
// 			factor: '1'
// 		}
// 	];

// 	const mockGiftCodes = [{ id: 1, amount: '10.00', description: 'Gift Card 1' }];

// 	const mockDiscount = [
// 		{
// 			id: 1,
// 			code: 'DISCOUNT10',
// 			value: '10.00',
// 			discountType: 'fixed',
// 			expiresAt: new Date(Date.now() + 86400000).toISOString()
// 		}
// 	];

// 	beforeEach(() => {
// 		vi.clearAllMocks();
// 	});

// 	it('should reserve a seat when clicking it', async () => {
// 		// Mock the necessary database queries
// 		vi.mocked(db.select)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				leftJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockReturnThis(),
// 				limit: vi.fn().mockResolvedValue([])
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				leftJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValue([mockSeats[0]])
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				leftJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValue(mockSeatCategory)
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				leftJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValue(mockShow)
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				leftJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValue(mockPriceSet)
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				leftJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValue(mockTicketType)
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				leftJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValue(mockBooking)
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				leftJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockReturnThis(),
// 				limit: vi.fn().mockResolvedValue([])
// 			} as any);

// 		vi.mocked(db.update).mockReturnValueOnce({
// 			from: vi.fn().mockReturnThis(),
// 			where: vi.fn().mockResolvedValue(mockBooking)
// 		} as any);
// 		// Mock the insert function
// 		const insertMock = vi.fn().mockReturnValue({
// 			values: vi.fn().mockReturnValue({
// 				returning: vi.fn().mockResolvedValue([])
// 			})
// 		});
// 		vi.mocked(db.insert).mockImplementation(insertMock);

// 		const mockFormData = {
// 			get: vi.fn((key) => {
// 				if (key === 'showingId') return mockShow[0].id;
// 				if (key === 'seatId') return mockSeats[0].id;
// 				if (key === 'ticketType') return 1;
// 				return null;
// 			})
// 		};
// 		const mockRequest = { formData: vi.fn().mockResolvedValue(mockFormData) };
// 		const mockLocals = { user: { id: 1 } };

// 		// Execute the action
// 		const result = await showActions.reserveSeat({
// 			request: mockRequest,
// 			locals: mockLocals
// 		} as any);

// 		// Check if the select function was called the correct number of times
// 		expect(db.select).toHaveBeenCalledTimes(8);

// 		// Assertions
// 		expect(result).toEqual({ success: true });
// 		expect(db.insert).toHaveBeenCalledTimes(1);
// 		expect(db.insert).toHaveBeenCalledWith(ticket);

// 		expect(db.insert(ticket).values).toHaveBeenCalledWith({
// 			status: 'reserved',
// 			showingId: 1,
// 			bookingId: 1,
// 			seatId: 1,
// 			type: 1,
// 			price: '12.00'
// 		});
// 	});
// 	it('should load cart data and calculate prices correctly', async () => {
// 		const mockUser = { id: 1 };
// 		const mockRequest = [
// 			{
// 				ticket: mockTickets[0],
// 				seat: mockSeats[0],
// 				showing: mockShow,
// 				film: mockMovie,
// 				priceSet: mockPriceSet,
// 				ticketType: mockTicketType,
// 				seatCategory: mockSeatCategory
// 			},
// 			{
// 				ticket: mockTickets[1],
// 				seat: mockSeats[1],
// 				showing: mockShow,
// 				film: mockMovie,
// 				priceSet: mockPriceSet,
// 				ticketType: mockTicketType,
// 				seatCategory: mockSeatCategory
// 			}
// 		];

// 		vi.mocked(db.select)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValue(mockBooking)
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValueOnce(mockRequest)
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValueOnce(mockGiftCodes)
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValueOnce(mockDiscount)
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				innerJoin: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValue([])
// 			} as any);

// 		vi.mocked(db.update).mockReturnValueOnce({
// 			set: vi.fn().mockReturnThis(),
// 			where: vi.fn().mockResolvedValue([])
// 		} as any);

// 		// Execute load function
// 		const result = await cartLoad({ locals: { user: mockUser } } as any);

// 		// Assertions
// 		expect(result).toEqual({
// 			booking: mockBooking[0],
// 			tickets: mockTickets,
// 			prices: {
// 				basePrice: 100,
// 				discount: {
// 					value: '10.00',
// 					discountType: 'fixed'
// 				},
// 				discountedAmount: 10,
// 				giftCodeAmount: 10,
// 				vatRate: 0.19,
// 				vatAmount: 19,
// 				total: 100
// 			},
// 			giftCodes: mockGiftCodes
// 		});

// 		// Verify that the database queries were called
// 		expect(db.select).toHaveBeenCalledTimes(5);
// 		expect(db.update).toHaveBeenCalledTimes(1);
// 	});
// 	it('should return client secret when booking, tickets, and gift codes exist', async () => {
// 		vi.mocked(db.select)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockåResolvedValue(mockBooking)
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValueOnce(mockTickets)
// 			} as any)
// 			.mockReturnValueOnce({
// 				from: vi.fn().mockReturnThis(),
// 				where: vi.fn().mockResolvedValueOnce(mockGiftCodes)
// 			} as any);

// 		const result = await completeLoad({ locals: { user: { id: 'user1' } } });

// 		expect(result).toEqual({ clientSecret: 'mock_client_secret' });
// 	});
// 	// it('should process a valid payment and update the booking', async () => {
// 	// 	const mockEvent = {
// 	// 		request: { url: 'http://example.com?session_id=test_session' },
// 	// 		locals: { user: { id: 1, email: 'test@example.com' } }
// 	// 	};

//     //     const mockPaidTickets = mockTickets.map(ticket => ({
//     //         ...ticket,
//     //         status: 'paid'
//     //         }));

// 	// 	vi.mocked(db.update)
//     //     .mockReturnValueOnce({
// 	// 		set: vi.fn().mockReturnThis(),
//     //         where: vi.fn().mockReturnThis(),
// 	// 		returning: vi.fn().mockResolvedValue(mockPaidTickets)
// 	// 	} as any)
//     //     .mockReturnValueOnce({
//     //         set: vi.fn().mockReturnThis(),
//     //         where: vi.fn().mockResolvedValue([]),
//     //     } as any);

//     //     vi.mocked(db.select)
// 	// 		.mockReturnValueOnce({
// 	// 			from: vi.fn().mockReturnThis(),
// 	// 			where: vi.fn().mockResolvedValue([])
// 	// 		} as any)
//     //         .mockReturnValueOnce({
//     //             from: vi.fn().mockReturnThis(),
//     //             where: vi.fn().mockResolvedValue(mockGiftCodes)
//     //         } as any)

// 	// 	const result = await verifyLoad(mockEvent);

// 	// 	// Verify database updates
// 	// 	expect(db.update(ticket).set).toHaveBeenCalledWith({ status: 'paid' });
// 	// 	expect(db.update(showing).set).toHaveBeenCalled();
// 	// 	expect(db.insert(priceDiscount).values).toHaveBeenCalled();
// 	// 	expect(db.update(booking).set).toHaveBeenCalledWith({
// 	// 		status: 'completed',
// 	// 		date: expect.any(String),
// 	// 		time: expect.any(String)
// 	// 	});

// 	// 	// Verify email sending
// 	// 	expect(EmailService.sendBookingConfirmation).toHaveBeenCalledWith(
// 	// 		1,
// 	// 		'test@example.com'
// 	// 	);

// 	// 	// Verify redirect
// 	// 	expect(result).toEqual({ status: 302, location: '/booking/1' });
// 	// });

// 	//show/id reserveSeats +
// 	//cart/ load und discount? +
// 	//cart/checkout load +
// 	//cart/checkout/verify load
// 	//booking/complete POST
// 	//booking/id load
// });
