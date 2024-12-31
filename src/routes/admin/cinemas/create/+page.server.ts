import { db } from '$lib/server/db/index.js';
import { cinema } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const address = formData.get('adress') as string;
		const opentime = formData.get('opening_time') as string;
		let closetime = formData.get('closing_time') as string;
		if(closetime == "00:00:00"){
			closetime = "24:00:00";
		}
		try {
			await db
				.insert(cinema)
				.values({ name: name, address: address, opentime: opentime, closeTime: closetime })
				.execute();
		} catch (error) {
			console.log(error);
		}
	}
};
