// src/routes/seat-categories/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './v3/$types';
import { db } from '$lib/server/db';
import { seatCategory } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';


export const load: PageServerLoad = async () => {
    try {
        const categories = await db.select().from(seatCategory).where(
            eq(seatCategory.isActive, true)
        );

        return {
            categories
        };
    } catch (error) {
        console.error('Error loading categories:', error);
        return {
            categories: []
        };
    }
};

export const actions = {
    create: async ({ request }) => {
        const formData = await request.formData();

        // Convert and validate form data
        const width = parseInt(formData.get('width') as string);
        const height = parseInt(formData.get('height') as string);
        const price = parseFloat(formData.get('price') as string);

        // Validate required fields
        if (!formData.get('name') || !formData.get('color') || isNaN(width) || isNaN(height) || isNaN(price)) {
            return fail(400, {
                success: false,
                message: 'Missing or invalid required fields',
                values: Object.fromEntries(formData)
            });
        }

        try {
            const values = {
                name: String(formData.get('name')),
                description: formData.get('description') ? String(formData.get('description')) : null,
                color: String(formData.get('color')),
                width: width,
                height: height,
                price: price,
                customPath: String(formData.get('customPath')),
                isActive: true
            } as const;


            const newCategory = await db.insert(seatCategory)
                .values(values)
                .returning();

            console.log('newCategory:', newCategory);

            return {
                type: 'success',
                data: newCategory[0]
            };
        } catch (error) {
            console.error('Error creating seat category:', error);
            return fail(500, {
                success: false,
                message: 'Failed to create seat category',
                values: Object.fromEntries(formData)
            });
        }
    },


    update: async ({ request }) => {
        const formData = await request.formData();
        const id = parseInt(formData.get('id') as string);

        const width = parseInt(formData.get('width') as string);
        const height = parseInt(formData.get('height') as string);
        try {
            const updatedCategory = await db
                .update(seatCategory)
                .set({
                    name: String(formData.get('name')),
                    description: formData.get('description') ? String(formData.get('description')) : null,
                    color: String(formData.get('color')),
                    width: width,
                    height: height,
                    price: formData.get('price') as string,
                    customPath: String(formData.get('customPath'))
                })
                .where(eq(seatCategory.id, id))
                .returning();

            return {
                type: 'success',
                data: updatedCategory[0]
            };
        } catch (error) {
            return fail(500, {
                type: 'error',
                message: 'Failed to update category'
            });
        }
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = parseInt(formData.get('id') as string);

        try {
            // Soft delete by setting isActive to false
            await db
                .update(seatCategory)
                .set({ isActive: false })
                .where(eq(seatCategory.id, id));

            return {
                type: 'success',
                message: 'Category deleted successfully'
            };
        } catch (error) {
            return fail(500, {
                type: 'error',
                message: 'Failed to delete category'
            });
        }
    }
} satisfies Actions;