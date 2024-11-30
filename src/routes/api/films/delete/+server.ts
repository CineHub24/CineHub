import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

import { error, json, type RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
    const { id } = await request.json(); // Get the film ID from the request body

    if (!id) {
        throw error(400, 'Film ID is required');
    }

    try {
        // Delete the film with the given ID
        await db.delete(table.film).where(eq(table.film.id, id));

        return json({ success: true });
    } catch (err) {
        console.error('Error deleting film:', err);
        throw error(500, 'Failed to delete the film');
    }
};
