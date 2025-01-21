import { ticket } from '$lib/paraglide/messages.js';
import { db } from '$lib/server/db';
import {
	priceSet,
	seatCategory,
	ticketType,
	type SeatCategory,
	type TicketType
} from '$lib/server/db/schema';

export const load = async (event) => {
	const seatCategories = await db.select().from(seatCategory).orderBy(seatCategory.price);
	let newSeatCategory: number[] = [];
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
			createdAt: new Date()
		};

		newSeatCategory = (
			await db.insert(seatCategory).values(standardSeat).returning({ id: seatCategory.id })
		).map((cat) => cat.id);
	}

	const ticketTypes = await db.select().from(ticketType);
	let newticketType: number[] = [];
	if (ticketTypes.length === 0) {
		newticketType = (
			await db
				.insert(ticketType)
				.values({
					name: 'Erwachsen',
					description: 'Standard',
					factor: '1'
				})
				.returning({ id: ticketType.id })
		).map((type) => type.id);
	}

	const priceSets = await db.select().from(priceSet);
	if (priceSets.length === 0) {
		await db
			.insert(priceSet)
			.values({
				name: 'Standard',
				priceFactor: '1',
				seatCategoryPrices: newSeatCategory ? newSeatCategory : seatCategories.map((cat) => cat.id),
				ticketTypes: newticketType ? newticketType : ticketTypes.map((type) => type.id)
			})
			.returning({ id: priceSet.id });
	}
};
