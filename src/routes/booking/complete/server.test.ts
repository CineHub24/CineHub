import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './+server'; // Stellen Sie sicher, dass dieser Pfad korrekt ist
import { db } from '$lib/server/db';
import { EmailService } from '$lib/utils/emailService';
import * as languageAwareModule from '$lib/utils/languageAware';

// Mocks
vi.mock('$lib/server/db', () => ({
db: {
update: vi.fn(() => ({
set: vi.fn(() => ({
where: vi.fn(() => ({
returning: vi.fn()
}))
}))
}))
}
}));

vi.mock('$lib/utils/emailService', () => ({
EmailService: vi.fn().mockImplementation(() => ({
sendBookingConfirmation: vi.fn()
}))
}));

vi.mock('$lib/utils/languageAware', () => ({
languageAwareGoto: vi.fn()
}));

// Mock für fetch
global.fetch = vi.fn();

describe('POST endpoint', () => {
const mockLocals = {
user: { id: 1, email: 'test@example.com' }
};

beforeEach(() => {
vi.clearAllMocks();
});

it('should process a successful payment and update the database', async () => {
// Mock PayPal API responses
global.fetch.mockResolvedValueOnce({
json: () => Promise.resolve({ access_token: 'mock_token' })
}).mockResolvedValueOnce({
json: () => Promise.resolve({
status: 'COMPLETED',
purchase_units: [{ reference_id: '123' }]
})
});

// Mock database updates
vi.mocked(db.update).mockReturnValue({
set: vi.fn().mockReturnThis(),
where: vi.fn().mockReturnThis(),
returning: vi.fn().mockResolvedValue([{ id: 1, showingId: 1 }])
} as any);

const mockRequest = {
json: vi.fn().mockResolvedValue({ orderId: 'mock_order_id' })
};

const response = await POST({ request: mockRequest, locals: mockLocals } as any);
const responseData = await response.json();

expect(responseData).toEqual({ success: true });
expect(db.update).toHaveBeenCalledTimes(3); // ticket, showing, and booking updates
expect(EmailService).toHaveBeenCalled();
});

it('should handle unauthorized access', async () => {
const response = await POST({ request: {}, locals: {} } as any);

expect(response.status).toBe(401);
expect(await response.text()).toBe('Unauthorized');
});


it('should handle internal server error', async () => {
global.fetch.mockResolvedValueOnce({
json: () => Promise.resolve({ access_token: 'mock_token' })
}).mockResolvedValueOnce({
json: () => Promise.resolve({
status: 'COMPLETED',
purchase_units: [{ reference_id: '123' }]
})
});

vi.mocked(db.update).mockRejectedValue(new Error('Database error'));

const mockRequest = {
json: vi.fn().mockResolvedValue({ orderId: 'mock_order_id' })
};

const response = await POST({ request: mockRequest, locals: mockLocals } as any);

expect(response.status).toBe(500);
expect(await response.text()).toBe('Internal Server Error');
});
});