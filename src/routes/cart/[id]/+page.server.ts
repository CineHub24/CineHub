import { db } from '$lib/server/db';
import { film, priceDiscount, showing } from '$lib/server/db/schema';
import { error, fail, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne, and} from 'drizzle-orm';

export const load = async ({ url }) => {
	const showingId = <unknown>url.pathname.replace('/cart/', '');

    const tickets = [
        {
            "id": 0,
            "showingId": showingId,
            "state": "reserved",
            "type": "adult",
            "price": 50,
            "seatId": 0,
        },
        {
            "id": 1,
            "showingId": showingId,
            "state": "reserved",
            "type": "adult",
            "price": 3,
            "seatId": 1,
        }
    ]

    function calculatePrice(tickets: any) {
        return 10
    }

    const booking = {
        "id": 0,
        "date": "2024-11-12Z123.344",
        "discountId": -1,
        "totalPrice": calculatePrice(tickets),
        "tickets": tickets,
    }
    

    return booking
};

export const actions = {

    discount: async ({ request }) => {

        const data = await request.formData();
        const discountCode = data.get('discount-code') as string;
        try {
            const discount = await db.select().from(priceDiscount).where(and(eq(priceDiscount.code, discountCode), gte(priceDiscount.expiresAt, new Date().toISOString())));
            if (discount.length === 0) {
                return fail(400, {error:'Discount code not found or expired'});
            } else {
                console.log(discount[0]);
                return {
                    success: `Discount code applied successfully`, 
                    discount: discount[0]
                }
            }
        } catch (error) {
            console.log(error);
            return fail(500, {error: 'Server error while checking discount code'});
        }
        

        

    }


}