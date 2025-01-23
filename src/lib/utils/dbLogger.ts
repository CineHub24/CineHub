import { db } from '$lib/server/db';
import { logs } from '$lib/server/db/schema';
import type { RequestEvent } from '@sveltejs/kit';

export enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

export const logToDB = async (
    level: LogLevel,
    message: string,
    event: RequestEvent
) => {
    try {
        const metadata = {
            url: event.url.toString(), // Store the URL as a string
            method: event.request.method,
            // Add other relevant non-circular properties
            clientIp: event.getClientAddress(),
            routeId: event.route.id,
            params: event.params
        };

        const userEmail = event?.locals?.user?.email || 'unknown user';
        const role = event?.locals?.user?.role || 'unknown role';
        const route = event?.route?.id || 'unknown route';
         
        message = `${message} - User: ${userEmail} - Role: ${role} - Route: ${route}`;

        await db.insert(logs).values({
            level,
            message,
            metadata: JSON.stringify(metadata) // Stringify only the safe metadata
        });
    } catch (error) {
        console.error('Failed to log to database:', error);
    }
};