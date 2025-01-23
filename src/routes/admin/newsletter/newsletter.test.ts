import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';
import { db } from '$lib/server/db';
import { EmailService } from '$lib/utils/emailService';
import { fail } from '@sveltejs/kit';

vi.mock('$lib/server/db', () => ({
db: {
select: vi.fn().mockReturnThis(),
from: vi.fn().mockResolvedValue([])
}
}));

vi.mock('$lib/utils/emailService');
vi.mock('$env/static/private', () => ({
VITE_GMAIL_USER: 'test@example.com',
VITE_GMAIL_APP_PASSWORD: 'testpassword'
}));

describe('Newsletter actions', () => {
beforeEach(() => {
vi.clearAllMocks();
});

it('should fail if subject or content is missing', async () => {
const request = {
formData: vi.fn().mockResolvedValue(new Map())
};

const result = await actions.sendNewsletter({ request } as any);

expect(result).toEqual(
fail(400, {
error: 'Betreff und Inhalt sind erforderlich'
})
);
});

it('should fail if no subscribers are found', async () => {
const request = {
formData: vi.fn().mockResolvedValue(
new Map([
['subject', 'Test Subject'],
['content', 'Test Content']
])
)
};

const result = await actions.sendNewsletter({ request } as any);

expect(result).toEqual(
fail(400, {
error: 'Keine Newsletter-Abonnenten gefunden'
})
);
});

it('should send newsletter successfully', async () => {
const request = {
formData: vi.fn().mockResolvedValue(
new Map([
['subject', 'Test Subject'],
['content', 'Test Content']
])
)
};

(db.select().from as jest.Mock).mockResolvedValue([
{ email: 'subscriber1@example.com' },
{ email: 'subscriber2@example.com' }
]);

const mockSendNewsletter = vi.fn().mockResolvedValue(undefined);
(EmailService as jest.Mock).mockImplementation(() => ({
sendNewsletter: mockSendNewsletter
}));

const result = await actions.sendNewsletter({ request } as any);

expect(result).toEqual({
success: true,
message: 'Newsletter erfolgreich an 2 Abonnenten versendet'
});

expect(EmailService).toHaveBeenCalledWith('test@example.com', 'testpassword');
expect(mockSendNewsletter).toHaveBeenCalledWith(
['subscriber1@example.com', 'subscriber2@example.com'],
'Test Subject',
'Test Content'
);
});

it('should handle errors during newsletter sending', async () => {
const request = {
formData: vi.fn().mockResolvedValue(
new Map([
['subject', 'Test Subject'],
['content', 'Test Content']
])
)
};

(db.select().from as jest.Mock).mockResolvedValue([
{ email: 'subscriber1@example.com' }
]);

(EmailService as jest.Mock).mockImplementation(() => ({
sendNewsletter: vi.fn().mockRejectedValue(new Error('Send failed'))
}));

const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

const result = await actions.sendNewsletter({ request } as any);

expect(result).toEqual(
fail(500, {
error: 'Newsletter konnte nicht versendet werden'
})
);

expect(consoleSpy).toHaveBeenCalledWith(
'Newsletter-Versand fehlgeschlagen:',
expect.any(Error)
);

consoleSpy.mockRestore();
});
});