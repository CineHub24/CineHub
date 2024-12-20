// /routes/admin/rooms/seat_category/[id]/+page.server.ts
import { db } from '$lib/server/db';
import { seatCategory } from '$lib/server/db/schema';
import { fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
    try {
        const category = await db.select()
            .from(seatCategory)
            .where(eq(seatCategory.id, parseInt(params.id)))
            .then(rows => rows[0]);

        if (!category) {
            throw redirect(303, '/admin/rooms/seat_category');
        }

        return {
            data: {
                category
            }
        };
    } catch (error) {
        console.error('Error loading category:', error);
        throw redirect(303, '/admin/rooms/seat_category');
    }
}

export const actions = {
    updateCategory: async ({ request, params }) => {
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

            await db.update(seatCategory)
                .set({
                    name,
                    description,
                    price: parseFloat(price),
                    emoji
                })
                .where(eq(seatCategory.id, parseInt(params.id)));

            shouldRedirect = true;
        } catch (error) {
            console.error('Error updating seat category:', error);
            return fail(500, {
                error: true,
                message: error.message || 'Failed to update seat category.',
                values: {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    price: formData.get('price'),
                    emoji: formData.get('emoji')
                }
            });
        }
        if (shouldRedirect) {
            return redirect(303, '/admin/rooms/seat_category');
        }
    }
} satisfies Actions;