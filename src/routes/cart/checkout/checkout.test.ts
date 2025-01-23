import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import { db } from '$lib/server/db';
import { booking, giftCodesUsed, ticket } from '$lib/server/db/schema';
import Stripe from 'stripe';

vi.mock('$lib/server/db', () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockResolvedValue([])
	}
}));

vi.mock('$lib/server/db/schema', () => ({
	booking: {},
	giftCodesUsed: {},
	ticket: {}
}));

vi.mock('stripe', () => ({
	default: vi.fn().mockImplementation(() => ({
		checkout: {
			sessions: {
				create: vi.fn().mockResolvedValue({ client_secret: 'mock_client_secret' })
			}
		}
	}))
}));

vi.mock('@sveltejs/kit', () => ({
	fail: vi.fn().mockImplementation((status, data) => ({ status, data }))
}));

describe('load function', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return client secret when booking and tickets exist', async () => {
		const mockBooking = { id: 'booking123', finalPrice: '10.00' };
		const mockTicket = { id: 'ticket123' };

		vi.mocked(db.select().from(booking).where).mockResolvedValueOnce([mockBooking]);
		vi.mocked(db.select().from(ticket).where).mockResolvedValueOnce([mockTicket]);
		vi.mocked(db.select().from(giftCodesUsed).where).mockResolvedValueOnce([]);

		const result = await load({ locals: { user: { id: 'user123' } } });

		expect(result).toEqual({ clientSecret: 'mock_client_secret' });
	});

	it('should fail when no current booking found', async () => {
		vi.mocked(db.select().from(booking).where).mockResolvedValueOnce([]);

		const result = await load({ locals: { user: { id: 'user123' } } });

		expect(result).toEqual({
			status: 500,
			data: { error: 'No current booking found' }
		});
	});

	it('should fail when no tickets or giftcards selected', async () => {
		const mockBooking = { id: 'booking123', finalPrice: '10.00' };

		vi.mocked(db.select().from(booking).where).mockResolvedValueOnce([mockBooking]);
		vi.mocked(db.select().from(ticket).where).mockResolvedValueOnce([]);
		vi.mocked(db.select().from(giftCodesUsed).where).mockResolvedValueOnce([]);

		const result = await load({ locals: { user: { id: 'user123' } } });

		expect(result).toEqual({
			status: 500,
			data: { error: 'No tickets or giftcards selected' }
		});
	});
});
