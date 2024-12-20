import { db} from "$lib/server/db";
import { cinema } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { PageServerData, PageServerLoad } from "./$types";



export const load:PageServerLoad = async ({url}) => {
    const id = parseInt(url.pathname.split('/').pop() ?? '0', 10);
    const cinemas = await db.select().from(cinema).where(eq(cinema.id,id));

    return {
        cinema: cinemas[0]
    };
}


export const actions = {
    update: async ({request}) => {
    
        const formData = await request.formData();
        const id = formData.get('id') as unknown as number;
        const name = formData.get('name') as string;
        const address = formData.get('adress') as string;
        const opentime = formData.get('opening_time') as string;
        const closeTime = formData.get('closing_time') as string;
    
        try {
            await db.update(cinema).set({name, address, opentime, closeTime}).where(eq(cinema.id, id));
        } catch (error) {
            console.log(error);
        }
    
    }
};
