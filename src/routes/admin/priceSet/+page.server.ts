import { db } from '$lib/server/db';
import { priceSet, seatCategory, ticketType } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';

export const load = async ({ url }) => {

    try {
        const priceSets = await db
            .select()
            .from(priceSet)
        const seatCategories = await db
            .select()
            .from(seatCategory)
        const ticketTypes = await db
            .select()
            .from(ticketType)
    
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
        console.log('createPriceSet');

        const data = await request.formData();

        console.log(data);
        
        // Extract form data
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

        console.log(newPriceSet);

        try {
            // Create price set in database
            await db.insert(priceSet).values(newPriceSet).execute();

        } catch (e) {
            console.error('Fehler beim Erstellen des Preissets:', e);
            return error(500, 'Fehler beim Erstellen des Preissets');
        }
    },
} satisfies Actions;