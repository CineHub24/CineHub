import { db } from '$lib/server/db';
import { priceSet, seatCategory, ticketType } from '$lib/server/db/schema';
import { error, type Actions, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async () => {

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
        error(500, "Internal Server Error DB");
    }
}
export const actions = {
	createPriceSet: async ({ request }) => {

        const data = await request.formData();

        
        const name = data.get('name') as string;
        const priceFactor = data.get('priceFactor') as string;
        const seatCategoryIds = data.getAll('seatCategoryPrices').map((id) => parseInt(id.toString())) as number[];
        const ticketTypeIds = data.getAll('ticketTypes').map((id) => parseInt(id.toString())) as number[];


        if(!name || !priceFactor) {
            return fail(400, { message: 'Missing inputs'});
        }
        
        const newPriceSet = {
            name,
            priceFactor,
            seatCategoryPrices: seatCategoryIds,
            ticketTypes: ticketTypeIds
        };
        try {
            await db.insert(priceSet).values(newPriceSet);

        } catch (e) {
            return error(500, 'Error creating the priceSet');
        }
    },
    delete: async ({request}) =>{

        const data = await request.formData();
        const id = data.get('priceSetId') as unknown as number;


        if(!id){
            return fail(400, {message:'Missing inputs'});
        }
		
		try{
			const result = await db.delete(priceSet).where(eq(priceSet.id,id))
		} catch(e){
			return fail(500, {message:'Error deleting price set'});
		}
	},
    updatePriceSet: async ({ request }) => {
        const data = await request.formData();
        
        const id = data.get('priceSetId') as unknown as number;
        const name = data.get('name') as string;
        const priceFactor = data.get('priceFactor') as string;
        const seatCategoryIds = data.getAll('seatCategoryPrices').map((id) => parseInt(id.toString())) as number[];
        const ticketTypeIds = data.getAll('ticketTypes').map((id) => parseInt(id.toString())) as number[];

        if (!id || !name || !priceFactor) {
            return fail(400, {message:'Missing inputs'}); 
        }

        try {
            await db
                .update(priceSet)
                .set({name: name, priceFactor: priceFactor, seatCategoryPrices: seatCategoryIds, ticketTypes: ticketTypeIds})
                .where(eq(priceSet.id, id));
        } catch (e) {
            return fail(500, {message:'Error updating price set'});
        }
    },
} satisfies Actions;