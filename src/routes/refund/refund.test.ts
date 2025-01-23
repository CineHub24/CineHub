import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ticket, priceDiscount, ticketStatusEnum, discountTypesEnum } from '$lib/server/db/schema';
import { languageAwareRedirect } from '$lib/utils/languageAware';
import { generateUniqueCode } from '$lib/utils/randomCode';
import * as m from '$lib/paraglide/messages';

// Mocks
vi.mock('$lib/server/db', () => {
const mockDb = {
selectDistinct: vi.fn().mockReturnThis(),
from: vi.fn().mockReturnThis(),
innerJoin: vi.fn().mockReturnThis(),
where: vi.fn().mockReturnThis(),
groupBy: vi.fn().mockResolvedValue([]),
update: vi.fn().mockReturnThis(),
set: vi.fn().mockReturnThis(),
insert: vi.fn().mockReturnThis(),
values: vi.fn().mockReturnThis(),
returning: vi.fn().mockResolvedValue([{ code: 'ABC123' }]),
};
return { db: mockDb };
});

vi.mock('$lib/utils/languageAware', () => ({
languageAwareRedirect: vi.fn(),
}));

vi.mock('$lib/utils/randomCode', () => ({
generateUniqueCode: vi.fn(),
}));

vi.mock('$lib/paraglide/messages', () => ({
internal_server_error: vi.fn(() => 'Internal server error'),
missing_inputs: vi.fn(() => 'Missing inputs'),
discount_code_created: vi.fn(() => 'Discount code created'),
}));

describe('Refund Page', () => {
beforeEach(() => {
vi.clearAllMocks();
});

describe('load function', () => {
it('should redirect if user is not logged in', async () => {
const event = { locals: {} };
vi.mocked(languageAwareRedirect).mockReturnValue({ status: 301, location: '/login' });

const result = await load(event as any);

expect(languageAwareRedirect).toHaveBeenCalledWith(301, '/login');
expect(result).toEqual({ status: 301, location: '/login' });
});

it('should return refundable shows if user is logged in', async () => {
const event = { locals: { user: { id: '123' } } };
const mockRefundableShows = [{ showId: 1, filmTitle: 'Test Movie' }];
vi.mocked(db.selectDistinct).mockReturnValue(db);
vi.mocked(db.groupBy).mockResolvedValue(mockRefundableShows);

const result = await load(event as any);

expect(result).toEqual({ refundableShows: mockRefundableShows });
});
});

describe('actions', () => {
describe('refund', () => {
it('should update ticket status to refunded', async () => {
const formData = new FormData();
formData.append('ticketIds', '1');
formData.append('ticketIds', '2');
const event = { request: { formData: () => Promise.resolve(formData) } };

await actions.refund(event as any);

expect(db.update).toHaveBeenCalledWith(ticket);
expect(db.set).toHaveBeenCalledWith({ status: ticketStatusEnum.enumValues[3] });
});

it('should return dbFail on error', async () => {
const formData = new FormData();
formData.append('ticketIds', '1');
const event = { request: { formData: () => Promise.resolve(formData) } };
vi.mocked(db.update).mockImplementation(() => {
throw new Error('Database error');
});

const result = await actions.refund(event as any);

expect(result).toEqual(fail(500, { message: 'Internal server error', database: true }));
});
});

describe('bookNew', () => {
it('should return dbFail even when inputs are correct', async () => {
const formData = new FormData();
formData.append('totalPrice', '10');
formData.append('ticketIds', '1');
const event = { request: { formData: () => Promise.resolve(formData) } };
vi.mocked(generateUniqueCode).mockResolvedValue('ABC123');

const result = await actions.bookNew(event as any);

expect(result).toEqual(fail(500, { message: 'Internal server error', database: true }));
});

it('should return dbFail if totalPrice is missing', async () => {
const formData = new FormData();
const event = { request: { formData: () => Promise.resolve(formData) } };

const result = await actions.bookNew(event as any);

expect(result).toEqual(fail(500, { message: 'Internal server error', database: true }));
});

it('should return dbFail on database error', async () => {
const formData = new FormData();
formData.append('totalPrice', '10');
formData.append('ticketIds', '1');
const event = { request: { formData: () => Promise.resolve(formData) } };
vi.mocked(generateUniqueCode).mockResolvedValue('ABC123');
vi.mocked(db.insert).mockImplementation(() => {
throw new Error('Database error');
});

const result = await actions.bookNew(event as any);

expect(result).toEqual(fail(500, { message: 'Internal server error', database: true }));
});
});
});
});