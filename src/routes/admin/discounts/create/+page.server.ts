import { db } from "$lib/server/db";
import { priceDiscount, type PriceDiscountForInsert } from "$lib/server/db/schema.js";

export const actions = {
	create: async ({ request }) => {
        const formData = await request.formData();        
        const code = formData.get('code') as string;
        const discountValue = formData.get('discount') as string;
        const discountType = formData.get('type') as string;
        const expiresAt = formData.get('expires') as string;
        const discountName = formData.get('name') as string;
        console.log(code, discountValue, discountType, expiresAt);
        
        const discount:PriceDiscountForInsert = {
            name: discountName,
            code: code,
            value: discountValue,
            discountType: discountType as 'percentage' | 'fixed',
            expiresAt: expiresAt
        }

        try {
            await db.insert(priceDiscount).values(discount);
        } catch (e) {
            console.log(e);
        }
       
    }
};
