import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { logs } from '$lib/server/db/schema';



export async function GET() {
    try {
        const logEntries = await db.select().from(logs).orderBy(logs.createdAt).limit(100);
        return json(logEntries);
    } catch (error) {
        return json({ error: 'Failed to fetch logs' + error }, { status: 500 });
    }
}
