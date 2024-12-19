import { db } from '$lib/server/db'; 
import { seatCategory } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';

export const load = async ({ url }) => {
    try {
        const seatCategories = await db
            .select()
            .from(seatCategory)
            .orderBy(seatCategory.price)
        return {
            seatCategories
        };
    }
    catch (e) {
        console.log(e);
        throw error(500, "Internal Server Error DB");
    }
};
export const actions = {
	createSeatCategory: async ({ request }) => {

        const data = await request.formData();

        const name = data.get('name') as string;
        const price = data.get('price') as string;
        const description = data.get('description') as string;
        
        const newSeatCategory = {
            name,
            price,
            description
        };


        try {
            await db.insert(seatCategory).values(newSeatCategory).execute();

        } catch (e) {
            console.error('Error creating the priceSet:', e);
            return error(500, 'Error creating the priceSet');
        }
    },
    deleteSeatCategory: async ({request, url}) =>{

        const data = await request.formData();
        const id = data.get('id') as unknown as number;
		
		try{
			await db.delete(seatCategory).where(eq(seatCategory.id,id))
		} catch(e){
			console.log("error" + e)
		}
	},
    updateSeatCategory: async ({ request }) => {
        const data = await request.formData();
        
        const id = data.get('id') as unknown as number;
        const name = data.get('name') as string;
        const price = data.get('price') as string;
        const description = data.get('description') as string;


        if (!id || !name) {
            return error(400, 'Missing inputs'); 
        }

        try {
            await db
                .update(seatCategory)
                .set({name: name, price: price, description: description})
                .where(eq(seatCategory.id, id));
        } catch (e) {
            return error(500, ('Error updating seat category'));
        }
    },
} satisfies Actions;