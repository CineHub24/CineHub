import { db } from '$lib/server/db'; 
import { ticketType } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';

export const load = async ({ url }) => {
    try {
        const ticketTypes = await db
            .select()
            .from(ticketType)
        return {
            ticketTypes
        };
    }
    catch (e) {
        console.log(e);
        throw error(500, "Internal Server Error DB");
    }
};
export const actions = {
	createTicketType: async ({ request }) => {

        const data = await request.formData();

        const name = data.get('name') as string;
        const factor = data.get('factor') as string;
        const description = data.get('description') as string;
        
        const newticketType = {
            name,
            factor,
            description
        };


        try {
            await db.insert(ticketType).values(newticketType).execute();

        } catch (e) {
            console.error('Error creating the priceSet:', e);
            return error(500, 'Error creating the priceSet');
        }
    },
    deleteTicketType: async ({request, url}) =>{

        const data = await request.formData();
        const id = data.get('id') as unknown as number;
		
		try{
			await db.delete(ticketType).where(eq(ticketType.id,id))
		} catch(e){
			console.log("error" + e)
		}
	},
    updateTicketType: async ({ request }) => {
        const data = await request.formData();
        
        const id = data.get('id') as unknown as number;
        const name = data.get('name') as string;
        const factor = data.get('factor') as string;
        const description = data.get('description') as string;


        if (!id || !name) {
            return error(400, 'Missing inputs'); 
        }

        try {
            await db
                .update(ticketType)
                .set({name: name, factor: factor, description: description})
                .where(eq(ticketType.id, id));
        } catch (e) {
            return error(500, ('Error updating price set'));
        }
    },
} satisfies Actions;