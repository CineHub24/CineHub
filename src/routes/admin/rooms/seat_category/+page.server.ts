// /routes/admin/rooms/seat_category/+page.server.ts
import { db } from '$lib/server/db';
import { seatCategory } from '$lib/server/db/schema';
import { logToDB } from '$lib/utils/dbLogger';
import { fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load() {
    try {
        const categories = await db.select().from(seatCategory);
        return {
            data: {
                categories
            }
        };
    } catch (error) {
        console.error('Error loading seat categories:', error);
        return {
            data: {
                categories: [],
                error: 'Failed to load seat categories'
            }
        };
    }
}

export const actions = {
    deleteCategory: async (event) => {
        try {
            const formData = await event.request.formData();
            const categoryId = formData.get('categoryId') as string;

            await db.delete(seatCategory)
                .where(eq(seatCategory.id, parseInt(categoryId)));

            logToDB('info', `Seat category deleted with id: ${categoryId} by user: ${String(event.locals.user?.email)}  ${event.locals.user?.id}`);
            return {
                success: true,
                message: 'Category deleted successfully!'
            };
        } catch (error) {
            console.error('Error deleting category:', error);
            return fail(500, {
                error: true,
                message: error.message || 'Failed to delete category.'
            });
        }
    }
} satisfies Actions;