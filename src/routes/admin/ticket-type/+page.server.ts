import { db } from '$lib/server/db';
import { ticketType } from '$lib/server/db/schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';
import * as m from '$lib/paraglide/messages.js';

const dbFail = fail(500, { error: m.internal_server_error({}) });

export const load = async ({ url }) => {
	try {
		const ticketTypes = await db.select().from(ticketType);
		return {
			ticketTypes
		};
	} catch (e) {
		console.log(e);
		return dbFail;
	}
};
export const actions = {
	createTicketType: async ({ request }) => {
		const data = await request.formData();

		const name = data.get('name') as string;
		const factor = data.get('factor') as string;
		const description = data.get('description') as string;

		if (parseFloat(factor) < 0) {
			return fail(400, { message: m.invalid_factor({}) });
		}

		const newticketType = {
			name,
			factor,
			description
		};

		try {
			await db.insert(ticketType).values(newticketType).execute();
		} catch (e) {
			return dbFail;
		}
	},
	deleteTicketType: async ({ request, url }) => {
		const data = await request.formData();
		const id = data.get('id') as unknown as number;

		try {
			await db.delete(ticketType).where(eq(ticketType.id, id));
		} catch (e) {
			return dbFail;
		}
	},
	updateTicketType: async ({ request }) => {
		const data = await request.formData();

		const id = data.get('id') as unknown as number;
		const name = data.get('name') as string;
		const factor = data.get('factor') as string;
		const description = data.get('description') as string;

		if (parseFloat(factor) < 0) {
			return fail(400, { message: m.invalid_factor({}) });
		}

		if (!id || !name) {
			return fail(400, { message: m.missing_inputs({}) });
		}

		try {
			await db
				.update(ticketType)
				.set({ name: name, factor: factor, description: description })
				.where(eq(ticketType.id, id));
		} catch (e) {
			return dbFail;
		}
	}
} satisfies Actions;
