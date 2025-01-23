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
		let metadata = {};

		const userEmail = event?.locals?.user?.email || 'unknown user';
		const role = event?.locals?.user?.role || 'unknown role';
		const route = event?.route?.id || 'unknown route';
		 
		message = `${message} - User: ${userEmail} - Role: ${role} - Route: ${route}`;

		metadata = JSON.parse(JSON.stringify(event, (key, value) => {
			// Remove circular references
			if (key === 'socket') return undefined;
			return value;
		}));

		await db.insert(logs).values({
			level,
			message,
			metadata: metadata
		});
	} catch (error) {
		console.error('Failed to log to database:', error);
	}
};
