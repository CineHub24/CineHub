import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { logs } from '$lib/server/db/schema';
import * as m from '$lib/paraglide/messages.js';
import { desc } from 'drizzle-orm';

export const load = async (event) => {
	try {
		const logEntries = await db.select().from(logs).orderBy(desc(logs.createdAt)).limit(100);
		return {
			logs: logEntries
		};
	} catch (error) {
		console.log(error);
		return fail(500, { error: m.internal_server_error({}) });
	}
};
