import { db } from '$lib/server/db';
import { priceDiscount } from '$lib/server/db/schema';
import { eq, is } from 'drizzle-orm';

export async function generateUniqueCode(length: number) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	const isCodeExisting = async () => {
		const codes = await db
			.select({ discountCode: priceDiscount.code })
			.from(priceDiscount)
			.where(eq(priceDiscount.code, result));

		return codes.length > 0;
	};

	while (true) {
		result = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			result += characters[randomIndex];
		}
		if (await isCodeExisting()) {
			continue;
		} else {
			break;
		}
	}
	return result;
}
