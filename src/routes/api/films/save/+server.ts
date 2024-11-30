import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { error, type RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
    const { title, genre, director, poster } = await request.json();

    if (!title || !genre || !director) {
        throw error(400, 'All fields are required');
    }

    try {
        await db.insert(table.film).values({
            title,
            genre,
            director,
            poster,
            releaseDate: new Date().toISOString(), // Use the current date or adapt as needed
        });

        return new Response(JSON.stringify({ success: true }));
    } catch (err) {
        console.error(err);
        throw error(500, 'Failed to save the film');
    }
};
