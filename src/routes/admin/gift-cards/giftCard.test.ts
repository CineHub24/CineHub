import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import { giftCodes } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import * as m from '$lib/paraglide/messages.js';

// Mocks
vi.mock('$lib/server/db', () => {
return {
db: {
select: vi.fn(() => ({
from: vi.fn(() => ({
orderBy: vi.fn()
}))
})),
insert: vi.fn(() => ({
values: vi.fn().mockResolvedValue({})
})),
update: vi.fn(() => ({
set: vi.fn(() => ({
where: vi.fn().mockResolvedValue({})
}))
})),
delete: vi.fn(() => ({
where: vi.fn().mockResolvedValue({})
}))
}
};
});

vi.mock('drizzle-orm', async (importOriginal) => {
const actual = await importOriginal();
return {
...actual,
eq: vi.fn(),
sql: vi.fn(),
};
});

vi.mock('@sveltejs/kit', async () => {
const actual = await vi.importActual('@sveltejs/kit');
return {
...actual,
fail: vi.fn().mockImplementation((status, data) => ({ status, data }))
};
});

vi.mock('$lib/paraglide/messages.js', () => ({
invalid_factor: vi.fn(() => 'Invalid factor'),
internal_server_error: vi.fn(() => 'Internal server error'),
}));

// Mock für schema.ts
vi.mock('$lib/server/db/schema', () => ({
giftCodes: {
amount: 'amount',
description: 'description',
id: 'id',
}
}));

describe('Gift Card Management', () => {
beforeEach(() => {
vi.clearAllMocks();
});

describe('load function', () => {
it('should load gift cards successfully', async () => {
const mockGiftCards = [
{ id: 1, amount: '10', description: 'Gift Card 1' },
{ id: 2, amount: '20', description: 'Gift Card 2' }
];

const mockOrderBy = vi.fn().mockResolvedValue(mockGiftCards);
const mockFrom = vi.fn(() => ({ orderBy: mockOrderBy }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));
vi.mocked(db.select).mockImplementation(mockSelect);

const result = await load({ url: new URL('http://test.com') } as any);

expect(db.select).toHaveBeenCalled();
expect(result).toEqual({ giftCards: mockGiftCards });
});
});

describe('createGiftCard action', () => {
it('should create a gift card successfully', async () => {
const mockFormData = new FormData();
mockFormData.append('description', 'New Gift Card');
mockFormData.append('amount', '30');

const mockRequest = { formData: vi.fn().mockResolvedValue(mockFormData) };

const result = await actions.createGiftCard({ request: mockRequest } as any);

expect(db.insert).toHaveBeenCalled();
expect(result).toBeUndefined();
});

it('should fail if amount is negative', async () => {
const mockFormData = new FormData();
mockFormData.append('description', 'Invalid Gift Card');
mockFormData.append('amount', '-10');

const mockRequest = { formData: vi.fn().mockResolvedValue(mockFormData) };

const result = await actions.createGiftCard({ request: mockRequest } as any);

expect(fail).toHaveBeenCalledWith(400, { message: 'Invalid factor' });
expect(result).toEqual({ status: 400, data: { message: 'Invalid factor' } });
});
});

describe('updateGiftCard action', () => {
it('should update a gift card successfully', async () => {
const mockFormData = new FormData();
mockFormData.append('giftCardId', '1');
mockFormData.append('description', 'Updated Gift Card');
mockFormData.append('amount', '40');

const mockRequest = { formData: vi.fn().mockResolvedValue(mockFormData) };

const result = await actions.updateGiftCard({ request: mockRequest } as any);

expect(db.update).toHaveBeenCalled();
expect(result).toBeUndefined();
});

it('should fail if amount is negative', async () => {
const mockFormData = new FormData();
mockFormData.append('giftCardId', '1');
mockFormData.append('description', 'Invalid Update');
mockFormData.append('amount', '-20');

const mockRequest = { formData: vi.fn().mockResolvedValue(mockFormData) };

const result = await actions.updateGiftCard({ request: mockRequest } as any);

expect(fail).toHaveBeenCalledWith(400, { message: 'Invalid factor' });
expect(result).toEqual({ status: 400, data: { message: 'Invalid factor' } });
});
});

describe('deleteGiftCard action', () => {
it('should delete a gift card successfully', async () => {
const mockFormData = new FormData();
mockFormData.append('giftCardId', '1');

const mockRequest = { formData: vi.fn().mockResolvedValue(mockFormData) };

const result = await actions.deleteGiftCard({ request: mockRequest } as any);

expect(db.delete).toHaveBeenCalled();
expect(result).toBeUndefined();
});
});
});