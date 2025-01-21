import { db } from '$lib/server/db';
import { priceSet, seatCategory, ticketType } from '$lib/server/db/schema';
import { fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as m from '$lib/paraglide/messages.js';

function JSONFormatter(seatCategories: string[], ticketTypes: string[]) {
	const seatCategoryJSON = JSON.parse(seatCategories[0]);
	const ticketTypeJSON = JSON.parse(ticketTypes[0]);

	let newSeatCategories: number[] = [];
	let newTicketTypes: number[] = [];

	for (let category of seatCategoryJSON) {
		newSeatCategories.push(category.value);
	}
	for (let type of ticketTypeJSON) {
		newTicketTypes.push(type.value);
	}

	return {
		seatCategories: newSeatCategories,
		ticketTypes: newTicketTypes
	};
}

export const load = async ({ url }) => {
	const priceSets = await db.select().from(priceSet).orderBy(priceSet.name);
	const seatCategories = await db.select().from(seatCategory).orderBy(seatCategory.price);
	const ticketTypes = await db.select().from(ticketType).orderBy(ticketType.name);

	return {
		priceSets,
		seatCategories,
		ticketTypes
	};
};
export const actions = {
	createPriceSet: async ({ request }) => {
		const data = await request.formData();

		const name = data.get('name') as string;
		const priceFactor = data.get('priceFactor') as string;
		const seatCategoryIds = data.getAll('seatCategoryPrices') as string[];
		const ticketTypeIds = data.getAll('ticketTypes') as string[];

		const { seatCategories, ticketTypes } = JSONFormatter(seatCategoryIds, ticketTypeIds);

		if (parseFloat(priceFactor) < 0) {
			return fail(400, { message: m.invalid_factor({}) });
		}

		const newPriceSet = {
			name,
			priceFactor,
			seatCategoryPrices: seatCategories,
			ticketTypes: ticketTypes
		};
		try {
			await db.insert(priceSet).values(newPriceSet);
		} catch (e) {
			return fail(500, { message: m.error_creating_price_set });
		}
	},
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('priceSetId') as unknown as number;

		if (!id) {
			return fail(400, { message: m.missing_inputs({}) });
		}

		try {
			const result = await db.delete(priceSet).where(eq(priceSet.id, id));
		} catch (e) {
			return fail(500, { message: m.error_deleting_price_set });
		}
	},
	updatePriceSet: async ({ request }) => {
		const data = await request.formData();

		const id = data.get('priceSetId') as unknown as number;
		const name = data.get('name') as string;
		const priceFactor = data.get('priceFactor') as string;
		const seatCategoryIds = data.getAll('seatCategoryPrices') as string[];
		const ticketTypeIds = data.getAll('ticketTypes') as string[];

		const { seatCategories, ticketTypes } = JSONFormatter(seatCategoryIds, ticketTypeIds);

		if (!id || !name || !priceFactor) {
			return fail(400, { message: m.missing_inputs({}), missing: true });
		}
		if (seatCategories.length === 0 || ticketTypes.length === 0) {
			return fail(400, { message: m.no_empty_array({}), empty: true });
		}
		if (parseFloat(priceFactor) < 0) {
			return fail(400, { message: m.invalid_factor({}) });
		}

		try {
			await db
				.update(priceSet)
				.set({
					name: name,
					priceFactor: priceFactor,
					seatCategoryPrices: seatCategories,
					ticketTypes: ticketTypes
				})
				.where(eq(priceSet.id, id));
		} catch (e) {
			return fail(500, { message: m.error_updating_price_set({}) });
		}
	}
} satisfies Actions;
