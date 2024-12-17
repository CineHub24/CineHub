import { db } from '$lib/server/db';
import { priceSet, seatCategory, ticketType } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';

export const load = async ({ url }) => {

    try {
        const priceSets = await db
            .select()
            .from(priceSet)
            .orderBy(priceSet.name)
        const seatCategories = await db
            .select()
            .from(seatCategory)
            .orderBy(seatCategory.price)
        const ticketTypes = await db
            .select()
            .from(ticketType)
            .orderBy(ticketType.name)
    
        return {
            priceSets,
            seatCategories,
            ticketTypes
        };
    }
    catch (e) {
        console.log(e);
        throw error(500, "Internal Server Error DB");
    }
}
export const actions = {
	createPriceSet: async ({ request }) => {

        const data = await request.formData();

        
        const name = data.get('name') as string;
        const priceFactor = data.get('priceFactor') as string;
        const seatCategoryIds = data.getAll('seatCategoryPrices').map((id) => parseInt(id.toString())) as number[];
        const ticketTypeIds = data.getAll('ticketTypes').map((id) => parseInt(id.toString())) as number[];
        
        const newPriceSet = {
            name,
            priceFactor,
            seatCategoryPrices: seatCategoryIds,
            ticketTypes: ticketTypeIds
        };


        try {
            await db.insert(priceSet).values(newPriceSet).execute();

        } catch (e) {
            console.error('Error creating the priceSet:', e);
            return error(500, 'Error creating the priceSet');
        }
    },
    delete: async ({request, url}) =>{

        const data = await request.formData();
        const id = data.get('priceSetId') as unknown as number;
		
		try{
			await db.delete(priceSet).where(eq(priceSet.id,id))
		} catch(e){
			console.log("error" + e)
		}
	},
    updatePriceSet: async ({ request }) => {
        const data = await request.formData();
        
        const id = data.get('id') as unknown as number;
        const name = data.get('name') as string;
        const priceFactor = data.get('priceFactor') as string;
        const seatCategoryIds = data.getAll('seatCategoryPrices').map((id) => parseInt(id.toString())) as number[];
        const ticketTypeIds = data.getAll('ticketTypes').map((id) => parseInt(id.toString())) as number[];

        console.log(data);

        if (!id || !name) {
            return error(400, 'Missing inputs'); 
        }

        try {
            await db
                .update(priceSet)
                .set({name: name, priceFactor: priceFactor, seatCategoryPrices: seatCategoryIds, ticketTypes: ticketTypeIds})
                .where(eq(priceSet.id, id));
        } catch (e) {
            return error(500, ('Error updating price set'));
        }
    },
} satisfies Actions;