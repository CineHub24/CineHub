import { db } from '$lib/server/db';
import { logs } from '$lib/server/db/schema';

export const logToDB = async (
    level: 'info' | 'warn' | 'error',
    message: string,
    metadata: object = {}
) => {
    try {
        await db.insert(logs).values({ level, message, metadata });
    } catch (error) {
        console.error('Failed to log to database:', error);
    }
};
