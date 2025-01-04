import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server'; // Passen Sie den Pfad an
import { db } from '$lib/server/db/index.js';
import { cinema } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// Mock the database
vi.mock('$lib/server/db/index.js', () => ({
db: {
insert: vi.fn(() => ({
values: vi.fn(() => ({
execute: vi.fn()
}))
}))
}
}));

describe('create action', () => {
let mockRequest: Request;
let mockInsert: any;
let mockValues: any;
let mockExecute: any;

beforeEach(() => {
mockRequest = {
formData: vi.fn()
} as unknown as Request;

mockExecute = vi.fn().mockResolvedValue({});
mockValues = vi.fn(() => ({ execute: mockExecute }));
mockInsert = vi.fn(() => ({ values: mockValues }));
(db.insert as any).mockReturnValue({ values: mockValues });
});

it('should create cinema successfully', async () => {
mockRequest.formData = vi.fn().mockResolvedValue(new Map([
['name', 'New Cinema'],
['adress', '123 Main St'],
['opening_time', '09:00'],
['closing_time', '22:00'],
]));

const result = await actions.create({ request: mockRequest } as RequestEvent);

expect(result).toEqual({ success: 'Cinema successfully created!' });
expect(db.insert).toHaveBeenCalledWith(cinema);
expect(mockValues).toHaveBeenCalledWith({
name: 'New Cinema',
address: '123 Main St',
opentime: '09:00',
closeTime: '22:00'
});
expect(mockExecute).toHaveBeenCalled();
});

it('should handle closing time of 00:00', async () => {
mockRequest.formData = vi.fn().mockResolvedValue(new Map([
['name', 'New Cinema'],
['adress', '123 Main St'],
['opening_time', '09:00'],
['closing_time', '00:00'],
]));

const result = await actions.create({ request: mockRequest } as RequestEvent);

expect(result).toEqual({ success: 'Cinema successfully created!' });
expect(mockValues).toHaveBeenCalledWith({
name: 'New Cinema',
address: '123 Main St',
opentime: '09:00',
closeTime: '24:00'
});
});

it('should fail if closing time is before opening time', async () => {
mockRequest.formData = vi.fn().mockResolvedValue(new Map([
['name', 'New Cinema'],
['adress', '123 Main St'],
['opening_time', '09:00'],
['closing_time', '08:00'],
]));

const result = await actions.create({ request: mockRequest } as RequestEvent);

expect(result).toEqual(fail(400, { error: 'Closing time must be after opening time' }));
});

it('should fail if closing time is after 24:00', async () => {
mockRequest.formData = vi.fn().mockResolvedValue(new Map([
['name', 'New Cinema'],
['adress', '123 Main St'],
['opening_time', '09:00'],
['closing_time', '25:00'],
]));

const result = await actions.create({ request: mockRequest } as RequestEvent);

expect(result).toEqual(fail(400, { error: 'Closing time must be before 24:00:00' }));
});

it('should handle server error', async () => {
mockRequest.formData = vi.fn().mockResolvedValue(new Map([
['name', 'New Cinema'],
['adress', '123 Main St'],
['opening_time', '09:00'],
['closing_time', '22:00'],
]));

mockExecute.mockRejectedValue(new Error('Database error'));

const result = await actions.create({ request: mockRequest } as RequestEvent);

expect(result).toEqual(fail(500, { error: 'Server error while creating cinema' }));
});
});