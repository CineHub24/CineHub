import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { priceDiscount } from '$lib/server/db/schema';

// Mocks
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn().mockReturnThis(),
from: vi.fn().mockReturnThis(),
where: vi.fn().mockResolvedValue([]),
delete: vi.fn().mockReturnThis()
}
}));

vi.mock('drizzle-orm', async (importOriginal) => {
const actual = await importOriginal();
return {
...actual,
eq: vi.fn(),
gte: vi.fn(),
sql: vi.fn()
};
});

vi.mock('@sveltejs/kit', async () => {
const actual = await vi.importActual('@sveltejs/kit');
return {
...actual,
fail: vi.fn().mockImplementation((status, data) => ({ status, data }))
};
});

// Mock für schema.ts
vi.mock('$lib/server/db/schema', () => ({
priceDiscount: {
id: 'id',
expiresAt: 'expiresAt'
}
}));

describe('Discount management', () => {
beforeEach(() => {
vi.clearAllMocks();
});

describe('load function', () => {
it('should load discounts successfully', async () => {
const mockDiscounts = [
{ id: 1, code: 'DISC1', expiresAt: '2023-12-31' },
{ id: 2, code: 'DISC2', expiresAt: '2024-06-30' }
];
vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue(mockDiscounts)
})
} as any);

const result = await load({} as any);

expect(db.select).toHaveBeenCalled();
expect(result).toEqual({ discounts: mockDiscounts });
});

it('should handle errors when loading discounts', async () => {
vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockRejectedValue(new Error('Database error'))
})
} as any);

const result = await load({} as any);

expect(fail).toHaveBeenCalledWith(500, { error: 'Failed to load Discounts' });
expect(result).toEqual({ status: 500, data: { error: 'Failed to load Discounts' } });
});
});

describe('delete action', () => {
it('should delete a discount successfully', async () => {
const mockFormData = new FormData();
mockFormData.append('id', '1');

const mockRequest = {
formData: vi.fn().mockResolvedValue(mockFormData)
};

vi.mocked(db.delete).mockReturnValue({
where: vi.fn().mockResolvedValue([{ id: 1 }])
} as any);

const result = await actions.delete({ request: mockRequest } as any);

expect(db.delete).toHaveBeenCalledWith(priceDiscount);
expect(result).toEqual({ success: true });
});

it('should handle errors when deleting a discount', async () => {
const mockFormData = new FormData();
mockFormData.append('id', '1');

const mockRequest = {
formData: vi.fn().mockResolvedValue(mockFormData)
};

vi.mocked(db.delete).mockReturnValue({
where: vi.fn().mockRejectedValue(new Error('Database error'))
} as any);

const result = await actions.delete({ request: mockRequest } as any);

expect(fail).toHaveBeenCalledWith(500, { error: 'Failed to delete Discount' });
expect(result).toEqual({ status: 500, data: { error: 'Failed to delete Discount' } });
});
});
});