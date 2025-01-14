import { db } from '$lib/server/db';
import {
	priceDiscount,
	subscribersNewsletter,
	type Discount,
	type PriceDiscountForInsert
} from '$lib/server/db/schema.js';
import { EmailService } from '$lib/utils/emailService.js';
import {fail} from "@sveltejs/kit"
import { eq, and} from 'drizzle-orm';


export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const code = formData.get('code') as string;
		const discountValue = formData.get('discount') as string;
		const discountType = formData.get('type') as string;
		const expiresAt = formData.get('expires') as string;
		const discountName = formData.get('name') as string;
		const newsletter = formData.get('newsletter') as string;

		console.log('newsletter', newsletter);

		const discount: PriceDiscountForInsert = {
			name: discountName,
			code: code,
			value: discountValue,
			discountType: discountType as 'percentage' | 'fixed',
			expiresAt: expiresAt
		};
            
		try {
            const alredyExists = await db.select().from(priceDiscount).where(eq(priceDiscount.code,code));
            if(alredyExists.length > 0){
                return fail(400,{error: 'Discount code already exists'});
            }

			const createdDiscount: Discount[] = await db
				.insert(priceDiscount)
				.values(discount)
				.returning();
			if (newsletter === 'on') {
				console.log('discount', createdDiscount[0]);
				const gmailUser = import.meta.env.VITE_GMAIL_USER;
				const gmailAppPassword = import.meta.env.VITE_GMAIL_APP_PASSWORD;
				const emailClient = new EmailService(gmailUser, gmailAppPassword);
				const subscribers = await db.select().from(subscribersNewsletter);
				for (const subscriber of subscribers) {
					try {
                        await emailClient.sendDiscountCode(subscriber.email as string, createdDiscount[0]);
                    } catch (error) {
                        continue;
                    }
				}
			}
            return { success: "Discount created successfully" };
		} catch (e) {
			return fail(500,{error: 'Failed to create discount'});
		}
	}
};
