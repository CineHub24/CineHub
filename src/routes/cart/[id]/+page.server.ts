import { db } from '$lib/server/db';
import { film, showing } from '$lib/server/db/schema';
import { error, type Actions } from '@sveltejs/kit';
import { eq, lt, gte, ne } from 'drizzle-orm';

export const load = async ({ url }) => {
	let showingId = <unknown>url.pathname.replace('/cart/', '');

    const tickets = [
        {
            "id": 0,
            "showingId": showingId,
            "state": "reserved",
            "type": "adult",
            "price": 5,
            "seatId": 0,
        },
        {
            "id": 1,
            "showingId": showingId,
            "state": "reserved",
            "type": "adult",
            "price": 5,
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