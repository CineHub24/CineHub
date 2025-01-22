import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { notifySeatChange } from '$lib/server/sse';

// Mock dependencies
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn(() => ({
from: vi.fn(() => ({
where: vi.fn(() => ({
then: vi.fn(),
})),
leftJoin: vi.fn(() => ({
where: vi.fn(() => ({
then: vi.fn(),
})),
})),
})),
})),
insert: vi.fn(() => ({
values: vi.fn(() => ({
returning: vi.fn(() => Promise.resolve([])),
})),
})),
update: vi.fn(() => ({
set: vi.fn(() => ({
where: vi.fn(() => Promise.resolve()),
})),
})),
delete: vi.fn(() => ({
where: vi.fn(() => Promise.resolve()),
})),
},
}));

vi.mock('$lib/utils/languageAware', () => ({
languageAwareRedirect: vi.fn(),
}));

vi.mock('$lib/server/sse', () => ({
notifySeatChange: vi.fn(),
}));

describe('Seat Booking Page', () => {
beforeEach(() => {
vi.clearAllMocks();
});

describe('load function', () => {
it('should return 404 if showing not found', async () => {
vi.mocked(db.select().from().where().then).mockResolvedValue([]);

const result = await load({ params: { id: '1' }, locals: {} } as any);

expect(result).toEqual(fail(404, { error: true, message: 'Showing not found' }));
});

it('should return showing data, hall, seats, and other required information', async () => {
const mockShowing = { id: 1, hallid: 1, priceSetId: 1 };
const mockHall = { id: 1, name: 'Hall 1' };
const mockSeats = [{ seat: { id: 1 }, category: { id: 1 } }];
const mockTickets = [{ seatId: 1, status: 'reserved', userId: 'user1' }];
const mockTicketTypes = [{ id: 1, name: 'Adult' }];
const mockPriceSet = { id: 1, name: 'Standard' };

vi.mocked(db.select().from().where().then)
.mockResolvedValueOnce([mockShowing])
.mockResolvedValueOnce([mockHall]);
vi.mocked(db.select().from().leftJoin().where().then)
.mockResolvedValueOnce(mockSeats)
.mockResolvedValueOnce(mockTickets);
vi.mocked(db.select().from().where().then)
.mockResolvedValueOnce(mockTicketTypes)
.mockResolvedValueOnce([mockPriceSet]);

const result = await load({ params: { id: '1' }, locals: {} } as any);

expect(result).toHaveProperty('showing', mockShowing);
expect(result).toHaveProperty('hall', mockHall);
expect(result).toHaveProperty('seats');
expect(result).toHaveProperty('seatCategories');
expect(result).toHaveProperty('ticketTypes', mockTicketTypes);
expect(result).toHaveProperty('priceSet', mockPriceSet);
});
});

describe('actions', () => {
describe('reserveSeat', () => {
it('should fail if user is not logged in', async () => {
const result = await actions.reserveSeat({ locals: {} } as any);
expect(result).toEqual(fail(401, { error: 'Must be logged in to reserve seats' }));
});

it('should reserve a seat successfully', async () => {
const mockFormData = {
get: vi.fn().mockReturnValue('1'),
getAll: vi.fn().mockReturnValue(['1'])
};
const mockRequest = { formData: () => Promise.resolve(mockFormData) };
const mockLocals = { user: { id: 'user1' } };

vi.mocked(db.select().from().leftJoin().where().then).mockResolvedValue([]);
vi.mocked(db.select().from().where().then)
.mockResolvedValueOnce([{ id: 1 }])
.mockResolvedValueOnce([{ id: 1 }])
.mockResolvedValueOnce([{ id: 1, priceSetId: 1 }])
.mockResolvedValueOnce([{ id: 1 }])
.mockResolvedValueOnce([{ id: 1 }]);
vi.mocked(db.insert().values().returning).mockResolvedValue([{ id: 1 }]);

const result = await actions.reserveSeat({ request: mockRequest, locals: mockLocals } as any);

expect(result).toEqual({ success: true });
expect(notifySeatChange).toHaveBeenCalled();
});
});
});
});