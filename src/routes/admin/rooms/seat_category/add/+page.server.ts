// /routes/admin/rooms/seat_category/add/+page.server.ts
import { db } from '$lib/server/db';
import { seatCategory } from '$lib/server/db/schema';
import { fail, type Actions } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const actions = {
    createCategory: async ({ request }) => {
        let shouldRedirect = false;
        try {
            const formData = await request.formData();
            const name = formData.get('name') as string;
            const description = formData.get('description') as string;
            const price = formData.get('price') as string;
            const emoji = formData.get('emoji') as string;

            if (!name || !description || !price || !emoji) {
                return fail(400, {
                    error: true,
                    message: 'All fields are required.',
                    values: { name, description, price, emoji }
                });
            }

            await db.insert(seatCategory).values({
                name,
                description,
                price: parseFloat(price),
                emoji
            });

            shouldRedirect = true;
        } catch (error) {
            console.error('Error creating seat category:', error);
            return fail(500, {
                error: true,
                message: error.message || 'Failed to create seat category.',
                values: {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    price: formData.get('price'),
                    emoji: formData.get('emoji')
                }
            });
        }
        if (shouldRedirect) {
            throw redirect(303, '/admin/rooms/seat_category');
        }
    }
} satisfies Actions;