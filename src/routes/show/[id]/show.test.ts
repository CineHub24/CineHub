import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions, load } from './+page.server';
import { db } from '$lib/server/db';
import { 
  seat, 
  booking, 
  ticket, 
  showing, 
  seatCategory, 
  ticketType, 
  priceSet 
} from '$lib/server/db/schema';
import { notifySeatChange } from '$lib/server/sse';

// Mock SSE connection
vi.mock('$lib/server/sse', () => ({
  notifySeatChange: vi.fn()
}));

// Create a comprehensive Drizzle-like mock
const createDrizzleMock = (data = []) => ({
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  leftJoin: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnValue(data),
  then: vi.fn().mockResolvedValue(data),
  returning: vi.fn().mockReturnValue(data)
});

describe('Seat Reservation System', () => {
  const mockUser = { id: 'user123' };
  const mockLocals = { user: mockUser };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('reserveSeat Action', () => {
    it('fails if user is not logged in', async () => {
      const formData = new FormData();
      const result = await actions.reserveSeat({ 
        request: new Request('http://localhost'), 
        locals: { user: null } 
      });

      expect(result?.status).toBe(401);
      expect(result?.data?.error).toBe('Must be logged in to reserve seats');
    });

    it('successfully reserves an available seat', async () => {
      // Prepare form data
      const formData = new FormData();
      formData.append('showingId', '1');
      formData.append('seatId', '10');
      formData.append('ticketType', '1');

      // Mock database queries
      vi.spyOn(db, 'select').mockImplementation(() => createDrizzleMock([
        [], // No existing tickets
        [{ id: 10, categoryId: 1 }], // Seat
        [{ id: 1 }], // Seat Category
        [{ id: 1, priceSetId: 1 }], // Showing
        [{ id: 1, priceFactor: 1 }], // Price Set
        [{ id: 1, factor: 1 }] // Ticket Type
      ]));

      vi.spyOn(db, 'insert').mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnValue([{ id: 'booking1' }])
      }));

      const result = await actions.reserveSeat({ 
        request: new Request('http://localhost', { method: 'POST', body: formData }), 
        locals: mockLocals 
      });

      expect(result).toHaveProperty('success', true);
      expect(notifySeatChange).toHaveBeenCalledWith('1');
    });
  });

  describe('cancelSeat Action', () => {
    it('successfully cancels a reserved seat', async () => {
      const formData = new FormData();
      formData.append('showingId', '1');
      formData.append('seatId', '10');

      // Mock existing ticket for cancellation
      vi.spyOn(db, 'select').mockImplementation(() => createDrizzleMock([
        [{ id: 'ticketToCancel', status: 'reserved' }]
      ]));

      vi.spyOn(db, 'delete').mockImplementation(() => ({}));

      const result = await actions.cancelSeat({ 
        request: new Request('http://localhost', { method: 'POST', body: formData }), 
        locals: mockLocals 
      });

      expect(result).toHaveProperty('success', true);
      expect(notifySeatChange).toHaveBeenCalledWith('1');
    });
  });

  describe('Load Function', () => {
    it('retrieves showing data successfully', async () => {
      // Mock comprehensive database queries
      vi.spyOn(db, 'select').mockImplementation(() => createDrizzleMock([
        [{ id: 1, hallid: 1, priceSetId: 1 }], // Showing
        [{ id: 1 }], // Cinema Hall
        [{ seat: { id: 10 }, category: { id: 1 } }], // Seats with Category
        [{ seatId: 10, status: 'available' }], // Tickets
        [{ id: 1 }], // Ticket Types
        [{ id: 1, priceFactor: 1 }] // Price Set
      ]));

      const result = await load({ 
        params: { id: '1' }, 
        locals: mockLocals 
      });

      expect(result).toHaveProperty('showing');
      expect(result).toHaveProperty('hall');
      expect(result).toHaveProperty('seats');
      expect(result).toHaveProperty('ticketTypes');
    });
  });
});