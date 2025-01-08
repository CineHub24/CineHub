import { db } from '$lib/server/db';
import { eq, gte } from 'drizzle-orm';
import {
	cinema,
	cinemaHall,
	film,
	priceDiscount,
	priceSet,
	type PriceDiscount
} from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
export const load = async (event) => {
	try {
		console.log('date');
		console.log(new Date().toISOString());
		const discounts = await db
			.select()
			.from(priceDiscount)
			.where(gte(priceDiscount.expiresAt, new Date().toISOString()));
            console.log(discounts); 
		return {
			discounts: discounts
		};
	} catch (error) {
        console.log(error);
		return fail(500, { error: 'Failed to load Discounts' });
	}
};
export const actions = {
    delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as unknown as number;
		console.log(id);
		try {
			await db.delete(priceDiscount).where(eq(priceDiscount.id, id));
            return { success: true };
		} catch (e) {
			console.log(e);
            return fail(500, { error: 'Failed to delete Discount' });
		}
	}
};
