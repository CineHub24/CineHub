import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';
import { db } from '$lib/server/db';
import { priceDiscount, subscribersNewsletter } from '$lib/server/db/schema';
import { EmailService } from '$lib/utils/emailService';
import { fail } from '@sveltejs/kit';

// Mocks
vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn(),
insert: vi.fn(),
}
}));

vi.mock('drizzle-orm', async (importOriginal) => {
const actual = await importOriginal();
return {
...actual,
eq: vi.fn(),
and: vi.fn(),
sql: vi.fn(),
};
});

vi.mock('$lib/utils/emailService', () => ({
EmailService: vi.fn().mockImplementation(() => ({
sendDiscountCode: vi.fn().mockResolvedValue(undefined)
}))
}));

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
code: 'code',
name: 'name',
value: 'value',
discountType: 'discountType',
expiresAt: 'expiresAt'
},
subscribersNewsletter: {}
}));

describe('Discount creation', () => {
beforeEach(() => {
vi.clearAllMocks();
});

it('should create a discount successfully without newsletter', async () => {
const mockFormData = new FormData();
mockFormData.append('code', 'TEST10');
mockFormData.append('discount', '10');
mockFormData.append('type', 'percentage');
mockFormData.append('expires', '2023-12-31');
mockFormData.append('name', 'Test Discount');

const mockRequest = {
formData: vi.fn().mockResolvedValue(mockFormData)
};

vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([])
})
} as any);

vi.mocked(db.insert).mockReturnValue({
values: vi.fn().mockReturnValue({
returning: vi.fn().mockResolvedValue([{
id: 1,
code: 'TEST10',
value: '10',
discountType: 'percentage',
expiresAt: '2023-12-31',
name: 'Test Discount'
}])
})
} as any);

const result = await actions.create({ request: mockRequest } as any);

expect(db.select).toHaveBeenCalled();
expect(db.insert).toHaveBeenCalledWith(priceDiscount);
expect(result).toEqual({ success: 'Discount created successfully' });
});

it('should create a discount and send newsletter', async () => {
const mockFormData = new FormData();
mockFormData.append('code', 'TEST20');
mockFormData.append('discount', '20');
mockFormData.append('type', 'fixed');
mockFormData.append('expires', '2024-06-30');
mockFormData.append('name', 'Test Discount 2');
mockFormData.append('newsletter', 'on');

const mockRequest = {
formData: vi.fn().mockResolvedValue(mockFormData)
};

vi.mocked(db.select)
.mockReturnValueOnce({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([])
})
} as any)
.mockReturnValueOnce({
from: vi.fn().mockResolvedValue([
{ email: 'test1@example.com' },
{ email: 'test2@example.com' }
])
} as any);

vi.mocked(db.insert).mockReturnValue({
values: vi.fn().mockReturnValue({
returning: vi.fn().mockResolvedValue([{
id: 2,
code: 'TEST20',
value: '20',
discountType: 'fixed',
expiresAt: '2024-06-30',
name: 'Test Discount 2'
}])
})
} as any);

const result = await actions.create({ request: mockRequest } as any);

expect(db.select).toHaveBeenCalledTimes(2);
expect(db.insert).toHaveBeenCalledWith(priceDiscount);
expect(EmailService).toHaveBeenCalled();
expect(result).toEqual({ success: 'Discount created successfully' });
});

it('should fail if discount code already exists', async () => {
const mockFormData = new FormData();
mockFormData.append('code', 'EXISTING');
mockFormData.append('discount', '15');
mockFormData.append('type', 'percentage');
mockFormData.append('expires', '2023-12-31');
mockFormData.append('name', 'Existing Discount');

const mockRequest = {
formData: vi.fn().mockResolvedValue(mockFormData)
};

vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockResolvedValue([{ id: 3, code: 'EXISTING' }])
})
} as any);

const result = await actions.create({ request: mockRequest } as any);

expect(db.select).toHaveBeenCalled();
expect(fail).toHaveBeenCalledWith(400, { error: 'Discount code already exists' });
expect(result).toEqual({ status: 400, data: { error: 'Discount code already exists' } });
});

it('should handle database errors', async () => {
const mockFormData = new FormData();
mockFormData.append('code', 'ERROR');
mockFormData.append('discount', '25');
mockFormData.append('type', 'percentage');
mockFormData.append('expires', '2023-12-31');
mockFormData.append('name', 'Error Discount');

const mockRequest = {
formData: vi.fn().mockResolvedValue(mockFormData)
};

vi.mocked(db.select).mockReturnValue({
from: vi.fn().mockReturnValue({
where: vi.fn().mockRejectedValue(new Error('Database error'))
})
} as any);

const result = await actions.create({ request: mockRequest } as any);

expect(db.select).toHaveBeenCalled();
expect(fail).toHaveBeenCalledWith(500, { error: 'Failed to create discount' });
expect(result).toEqual({ status: 500, data: { error: 'Failed to create discount' } });
});
});