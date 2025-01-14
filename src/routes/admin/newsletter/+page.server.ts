// src/routes/admin/newsletter/+page.server.ts
import { db } from '$lib/server/db';
import { subscribersNewsletter } from '$lib/server/db/schema';
import { EmailService } from '$lib/utils/emailService';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { VITE_GMAIL_USER, VITE_GMAIL_APP_PASSWORD } from '$env/static/private';

export const actions = {
	sendNewsletter: async ({ request }) => {
		try {
			const data = await request.formData();
			const subject = data.get('subject') as string;
			const content = data.get('content') as string;

			if (!subject || !content) {
				return fail(400, {
					error: 'Betreff und Inhalt sind erforderlich'
				});
			}

			// Get all subscriber emails
			const subscribers = await db.select().from(subscribersNewsletter);
			const emails = subscribers.map((sub) => sub.email).filter((email): email is string => email !== null);

			if (emails.length === 0) {
				return fail(400, {
					error: 'Keine Newsletter-Abonnenten gefunden'
				});
			}

			// Initialize email service
			const emailService = new EmailService(VITE_GMAIL_USER, VITE_GMAIL_APP_PASSWORD);

			// Send newsletter
			await emailService.sendNewsletter(emails, subject, content);

			return {
				success: true,
				message: `Newsletter erfolgreich an ${emails.length} Abonnenten versendet`
			};
		} catch (error) {
			console.error('Newsletter-Versand fehlgeschlagen:', error);
			return fail(500, {
				error: 'Newsletter konnte nicht versendet werden'
			});
		}
	}
} satisfies Actions;

export async function load() {
	const subscribers = await db.select().from(subscribersNewsletter);
	return {
		subscriberCount: subscribers.length
	};
}
