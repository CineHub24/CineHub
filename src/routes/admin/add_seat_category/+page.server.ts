import { db } from '$lib/server/db';
import { seatCategory } from '$lib/server/db/schema';
import { fail, type Actions } from '@sveltejs/kit';

export const actions = {
    createCategory: async ({ request }) => {
        try {
            const formData = await request.formData();
            const name = formData.get('name') as string;
            const description = formData.get('description') as string;
            const price = formData.get('price') as string;
            // now add a emoki to the seat category
            const emoji = formData.get('emoji') as string;

            if (!name || !description || !price) {
                throw new Error('All fields are required.');
            }

            //use the type from drizzle and build the insert object first



            // Insert the new seat category into the database
            await db.insert(seatCategory).values({
                name,
                description,
                price: parseFloat(price),
                emoji
            });

            return { success: true, message: 'Seat category created successfully!' };
        } catch (error) {
            console.error('Error creating seat category:', error);
            return fail(500, { error: true, message: error.message || 'Failed to create seat category.' });
        }
    }
} satisfies Actions;
