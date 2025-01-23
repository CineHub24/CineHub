import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { eq } from 'drizzle-orm';

// Mock the database and schema
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn(() => ({
from: vi.fn(() => ({
innerJoin: vi.fn(() => ({
innerJoin: vi.fn(() => ({
innerJoin: vi.fn(() => ({
innerJoin: vi.fn(() => ({
innerJoin: vi.fn(() => ({
innerJoin: vi.fn(() => ({
where: vi.fn()
}))
}))
}))
}))
}))
}))
}))
})),
update: vi.fn(() => ({
set: vi.fn(() => ({
where: vi.fn()
}))
}))
}
}));

vi.mock('$lib/server/db/schema', () => ({
ticket: { id: 'ticket.id', token: 'ticket.token', status: 'ticket.status', type: 'ticket.type', showingId: 'ticket.showingId', seatId: 'ticket.seatId' },
ticketType: { id: 'ticketType.id', name: 'ticketType.name' },
showing: { id: 'showing.id', date: 'showing.date', time: 'showing.time', hallid: 'showing.hallid', filmid: 'showing.filmid' },
cinemaHall: { id: 'cinemaHall.id', name: 'cinemaHall.name' },
film: { id: 'film.id', title: 'film.title' },
seat: { id: 'seat.id', row: 'seat.row', seatNumber: 'seat.seatNumber', categoryId: 'seat.categoryId' },
seatCategory: { id: 'seatCategory.id', name: 'seatCategory.name' }
}));

// Import after mocking
import { actions } from './+page.server';
import { db } from '$lib/server/db';
import { ticket, ticketType, showing, cinemaHall, film, seat, seatCategory } from '$lib/server/db/schema';

describe('Scanner Page Server Actions', () => {
beforeEach(() => {
vi.clearAllMocks();
});

describe('validate action', () => {
it('should return error for invalid ticket code', async () => {
const mockRequest = {
formData: vi.fn().mockResolvedValue(new FormData())
};

const result = await actions.validate({ request: mockRequest } as any);

expect(result).toEqual(fail(400, { error: 'Ungültiger Ticket-Code' }));
});

it('should return error for non-existent ticket', async () => {
const mockFormData = new FormData();
mockFormData.append('ticketData', 'non-existent-token');

const mockRequest = {
formData: vi.fn().mockResolvedValue(mockFormData)
};

vi.mocked(db.select)
.mockReturnValue({
from: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([])
})
})
})
})
})
})
})
});

const result = await actions.validate({ request: mockRequest } as any);

expect(result).toEqual(fail(500, { error: 'Ticket nicht gefunden' }));
});

it('should return error for already validated ticket', async () => {
const mockFormData = new FormData();
mockFormData.append('ticketData', 'validated-token');

const mockRequest = {
formData: vi.fn().mockResolvedValue(mockFormData)
};

vi.mocked(db.select)
.mockReturnValue({
from: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([
{ id: 1, status: 'validated', type: 'Adult', film: 'Test Movie', datum: '2023-06-01', uhrzeit: '20:00', saal: 'Saal 1', row: 'A', number: '1', category: 'Standard' }
])
})
})
})
})
})
})
})
});

const result = await actions.validate({ request: mockRequest } as any);

expect(result).toEqual(fail(400, { error: 'Ticket wurde bereits verwendet' }));
});

it('should return error for reserved but unpaid ticket', async () => {
const mockFormData = new FormData();
mockFormData.append('ticketData', 'reserved-token');

const mockRequest = {
formData: vi.fn().mockResolvedValue(mockFormData)
};

vi.mocked(db.select)
.mockReturnValue({
from: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([
{ id: 1, status: 'reserved', type: 'Adult', film: 'Test Movie', datum: '2023-06-01', uhrzeit: '20:00', saal: 'Saal 1', row: 'A', number: '1', category: 'Standard' }
])
})
})
})
})
})
})
})
});

const result = await actions.validate({ request: mockRequest } as any);

expect(result).toEqual(fail(400, { error: 'Ticket wurde noch nicht bezahlt' }));
});

it('should successfully validate a valid ticket', async () => {
const mockFormData = new FormData();
mockFormData.append('ticketData', 'valid-token');

const mockRequest = {
formData: vi.fn().mockResolvedValue(mockFormData)
};

const mockTicket = {
id: 1,
status: 'paid',
type: 'Adult',
film: 'Test Movie',
datum: '2023-06-01',
uhrzeit: '20:00',
saal: 'Saal 1',
row: 'A',
number: '1',
category: 'Standard'
};

vi.mocked(db.select)
.mockReturnValue({
from: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([mockTicket])
})
})
})
})
})
})
})
});

vi.mocked(db.update)
.mockReturnValue({
set: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue({ rowCount: 1 })
})
});

const result = await actions.validate({ request: mockRequest } as any);

expect(result).toEqual({
success: true,
message: 'Ticket gültig - Saal Saal 1}',
ticket: {
id: 1,
type: 'Adult',
film: 'Test Movie',
datum: '2023-06-01',
uhrzeit: '20:00',
saal: 'Saal 1',
sitz: 'A1',
category: 'Standard'
}
});

expect(db.update).toHaveBeenCalledWith(ticket);
expect(db.update().set).toHaveBeenCalledWith({ status: 'validated' });
});

it('should handle internal errors', async () => {
const mockFormData = new FormData();
mockFormData.append('ticketData', 'error-token');

const mockRequest = {
formData: vi.fn().mockResolvedValue(mockFormData)
};

vi.mocked(db.select)
.mockReturnValue({
from: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
innerJoin: vi.fn().mockReturnValue({
where: vi.fn().mockRejectedValue(new Error('Database error'))
})
})
})
})
})
})
})
});

const result = await actions.validate({ request: mockRequest } as any);

expect(result).toEqual(fail(500, { error: 'Ticket nicht gefunden' }));
});
});
});