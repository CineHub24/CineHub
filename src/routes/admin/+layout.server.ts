import { db } from '$lib/server/db';
import { seatCategory, type SeatCategory } from '$lib/server/db/schema';

export const load = async (event) => {
    const seatCategories = await db.select().from(seatCategory).orderBy(seatCategory.price);
    if (seatCategories.length === 0) {
        const standardSeat: SeatCategory = {
            id: 0,
            name: 'Regular Seat',
            description: 'Standard',
            color: '#ff0000',
            width: 40,
            height: 40,
            price: '10',
            customPath: 'M 0 0 h 40 v 40 h -40 Z',
            isActive: true,
            createdAt: new Date(),
        };

        await db.insert(seatCategory).values(standardSeat);
    }
}