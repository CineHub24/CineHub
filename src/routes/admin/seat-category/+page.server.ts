import { db } from '$lib/server/db';
import { seatCategory } from '$lib/server/db/schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';
import * as m from '$lib/paraglide/messages.js';

const dbFail = fail(500, { message: m.internal_server_error({}), database: true });

export const load = async ({ url }) => {
	const seatCategories = await db.select().from(seatCategory).orderBy(seatCategory.price);
	return {
		seatCategories
	};
};
export const actions = {
	createSeatCategory: async ({ request }) => {
		const data = await request.formData();

		const name = data.get('name') as string;
		const price = data.get('price') as string;
		const description = data.get('description') as string;
		const emoji = data.get('emoji') as string;

		const newSeatCategory = {
			name,
			price,
			description,
			emoji
		};

		try {
			await db.insert(seatCategory).values(newSeatCategory).execute();
		} catch (e) {
			return dbFail;
		}
	},
	deleteSeatCategory: async ({ request, url }) => {
		const data = await request.formData();
		const id = data.get('id') as unknown as number;

		try {
			await db.delete(seatCategory).where(eq(seatCategory.id, id));
		} catch (e) {
			return dbFail;
		}
	},
	updateSeatCategory: async ({ request }) => {
		const data = await request.formData();

		const id = data.get('id') as unknown as number;
		const name = data.get('name') as string;
		const price = data.get('price') as string;
		const description = data.get('description') as string;

		if (!id || !name) {
			return fail(400, {message: m.missing_inputs({})});
		}

		try {
			await db
				.update(seatCategory)
				.set({ name: name, price: price, description: description })
				.where(eq(seatCategory.id, id));
		} catch (e) {
			return dbFail;
		}
	}
} satisfies Actions;
