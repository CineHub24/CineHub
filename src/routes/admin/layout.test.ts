import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+layout.server'; // Passen Sie diesen Pfad an
import { seatCategory, ticketType, priceSet } from '$lib/server/db/schema';

// Mocking the db module
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn(),
insert: vi.fn(),
},
}));

// Import the mocked db after mocking
import { db } from '$lib/server/db';

describe('Load function', () => {
beforeEach(() => {
vi.clearAllMocks();

// Setup default mock implementations
vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
orderBy: vi.fn().mockResolvedValue([]),
}),
} as any);

vi.mocked(db.insert).mockReturnValue({
values: vi.fn().mockReturnValue({
returning: vi.fn().mockResolvedValue([{ id: 1 }]),
}),
} as any);
});

it('should create default seat category if none exist', async () => {
await load({});

expect(db.select).toHaveBeenCalled();
expect(vi.mocked(db.select().from)).toHaveBeenCalledWith(seatCategory);
expect(db.insert).toHaveBeenCalledWith(seatCategory);
expect(vi.mocked(db.insert().values)).toHaveBeenCalledWith(expect.objectContaining({
name: 'Regular Seat',
description: 'Standard',
color: '#ff0000',
width: 40,
height: 40,
price: '10',
customPath: 'M 0 0 h 40 v 40 h -40 Z',
isActive: true,
}));
});

it('should not create default seat category if some exist', async () => {
vi.mocked(db.select().from().orderBy).mockResolvedValueOnce([{ id: 1, name: 'Existing Seat' }] as any);

await load({});

expect(db.select).toHaveBeenCalled();
expect(vi.mocked(db.select().from)).toHaveBeenCalledWith(seatCategory);
expect(db.insert).not.toHaveBeenCalledWith(seatCategory);
});

it('should create default ticket type if none exist', async () => {
vi.mocked(db.select().from).mockImplementationOnce(() => ({
orderBy: vi.fn().mockResolvedValue([]),
}) as any);
vi.mocked(db.select().from).mockImplementationOnce(() => Promise.resolve([]));

await load({});

expect(db.select).toHaveBeenCalled();
expect(vi.mocked(db.select().from)).toHaveBeenCalledWith(ticketType);
expect(db.insert).toHaveBeenCalledWith(ticketType);
expect(vi.mocked(db.insert().values)).toHaveBeenCalledWith(expect.objectContaining({
name: 'Erwachsen',
description: 'Standard',
factor: '1'
}));
});

it('should not create default ticket type if some exist', async () => {
vi.mocked(db.select().from).mockImplementationOnce(() => ({
orderBy: vi.fn().mockResolvedValue([]),
}) as any);
vi.mocked(db.select().from).mockImplementationOnce(() => Promise.resolve([{ id: 1, name: 'Existing Type' }]));

await load({});

expect(db.select).toHaveBeenCalled();
expect(vi.mocked(db.select().from)).toHaveBeenCalledWith(ticketType);
expect(db.insert).not.toHaveBeenCalledWith(ticketType);
});

it('should create default price set if none exist', async () => {
vi.mocked(db.select().from).mockImplementationOnce(() => ({
orderBy: vi.fn().mockResolvedValue([{ id: 1 }]),
}) as any);
vi.mocked(db.select().from).mockImplementationOnce(() => Promise.resolve([{ id: 1 }]));
vi.mocked(db.select().from).mockImplementationOnce(() => Promise.resolve([]));

await load({});

expect(db.select).toHaveBeenCalled();
expect(vi.mocked(db.select().from)).toHaveBeenCalledWith(priceSet);
expect(db.insert).toHaveBeenCalledWith(priceSet);
expect(vi.mocked(db.insert().values)).toHaveBeenCalledWith(expect.objectContaining({
name: 'Standard',
priceFactor: '1',
}));
});

it('should not create default price set if some exist', async () => {
vi.mocked(db.select().from).mockImplementationOnce(() => ({
orderBy: vi.fn().mockResolvedValue([{ id: 1 }]),
}) as any);
vi.mocked(db.select().from).mockImplementationOnce(() => Promise.resolve([{ id: 1 }]));
vi.mocked(db.select().from).mockImplementationOnce(() => Promise.resolve([{ id: 1, name: 'Existing Set' }]));

await load({});

expect(db.select).toHaveBeenCalled();
expect(vi.mocked(db.select().from)).toHaveBeenCalledWith(priceSet);
expect(db.insert).not.toHaveBeenCalledWith(priceSet);
});
});