import { db } from '$lib/server/db';

import { logs } from '$lib/server/db/schema';

export const load = async (event) => {

    const logEntries = await db.select().from(logs).orderBy(logs.createdAt).limit(100);
    return{
        logs: logEntries
    }
}
