import { db } from '$lib/server/db';
import { giftCodes, priceSet, seatCategory, ticketType } from '$lib/server/db/schema';
import { fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as m from '$lib/paraglide/messages.js';
import { LogLevel, logToDB } from '$lib/utils/dbLogger';

export const load = async ({ url }) => {
	const giftCards = await db.select().from(giftCodes).orderBy(giftCodes.amount);

	return {
		giftCards
	};
};

export const actions = {
	createGiftCard: async (event) => {
		const request = event.request;
		const data = await request.formData();

		const description = data.get('description') as string;
		const amount = data.get('amount') as string;

		if (parseFloat(amount) < 0) {
			return fail(400, { message: m.invalid_factor({}) });
		}

		const newGiftCard: typeof giftCodes.$inferInsert = {
			amount,
			description
		};

		try {
			await db.insert(giftCodes).values(newGiftCard);
			await logToDB(LogLevel.INFO, 'Created gift card with amount ' + amount, event);
		} catch (e) {
			return fail(400, { message: m.invalid_factor({}) });
		}
	},
	updateGiftCard: async (event) => {
		const request = event.request;
		const data = await request.formData();
		const id = data.get('giftCardId') as unknown as number;
		const description = data.get('description') as string;
		const amount = data.get('amount') as string;

		if (parseFloat(amount) < 0) {
			return fail(400, { message: m.invalid_factor({}) });
		}

		try {
			await db.update(giftCodes).set({ amount, description }).where(eq(giftCodes.id, id));
			await logToDB(LogLevel.INFO, 'Updated gift card with id ' + id, event);
		} catch (e) {
			return fail(400, { message: m.internal_server_error({}) });
		}
	},
	deleteGiftCard: async (event) => {
		const request = event.request;
		const data = await request.formData();
		const id = data.get('giftCardId') as unknown as number;

		try {
			await db.delete(giftCodes).where(eq(giftCodes.id, id));
			await logToDB(LogLevel.INFO, 'Deleted gift card with id ' + id, event);
		} catch (e) {
			return fail(400, { message: m.internal_server_error({}) });
		}
	}
} satisfies Actions;
