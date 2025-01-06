import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { logs } from '$lib/server/db/schema';

export const load = async (event) => {
	try {
		const logEntries = await db.select().from(logs).orderBy(logs.createdAt).limit(100);
		return {
			logs: logEntries
		};
	} catch (error) {
		console.log(error);
		return fail(500, { error: 'Failed to load logs' });
	}
};
