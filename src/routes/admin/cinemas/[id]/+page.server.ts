import { db } from '$lib/server/db';
import { cinema, type Cinema } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const id = parseInt(url.pathname.split('/').pop() ?? '0', 10);
	const cinemas: Cinema[] = await db.select().from(cinema).where(eq(cinema.id, id));

	return {
		cinema: cinemas[0]
	};
};

export const actions = {
	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as unknown as number;
		const name = formData.get('name') as string;
		const address = formData.get('adress') as string;
		const opentime = formData.get('opening_time') as string;
		let closeTime = formData.get('closing_time') as string;

		if (closeTime == '00:00') {
			closeTime = '24:00';
		}
		console.log(closeTime);
		if (closeTime < opentime) {
			return fail(400, { error: 'Closing time must be after opening time' });
		}
		if (closeTime > '24:00:00') {
			return fail(400, { error: 'Closing time must be before 24:00:00' });
		}
		try {
			await db.update(cinema).set({ name, address, opentime, closeTime }).where(eq(cinema.id, id));
			return { success: 'Cinema successfully updated!' };
		} catch (error) {
			console.log(error);
			return fail(500, { error: 'Server error while updating cinema' });
		}
	}
};
