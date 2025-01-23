import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { cinema, cinemaHall, film, priceSet } from '$lib/server/db/schema';
import { LogLevel, logToDB } from '$lib/utils/dbLogger';

export const load = async (event) => {
	const cinemas = await db.select().from(cinema);
	return {
		cinemas: cinemas
	};
};
export const actions = {
	delete: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id') as unknown as number;
		console.log(id);
		try {
			await db.delete(cinema).where(eq(cinema.id, id));
			await logToDB(
				LogLevel.WARN,
				"Deleted cinema with id " + id,	
				event
			);
		} catch (e) {
			console.log(e);
		}
	}
};
