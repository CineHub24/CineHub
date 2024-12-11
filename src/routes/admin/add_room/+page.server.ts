import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { fail, type Actions } from '@sveltejs/kit';

interface Sitz {
    sitznummer: number;
    reihe: number;
    spalte: number;
    buchbar: boolean;
}

export const actions = {
    saveKinosaal: async ({ request }: Request) => {
        const data = await request.formData();
        const hallNumber = data.get('hall-number')?.toString();
        const sitzeJson = data.get('sitze')?.toString();

        if (!name || !sitzeJson) {
            return fail(400, {
                name,
                missing: !name ? 'name' : 'sitze'
            });
        }

        try {
            const sitze = JSON.parse(sitzeJson) as Sitz[];

            await db.insert(table.cinemaHall).values({
                hallNumber: hallNumber,
                capacity: sitze.length,
                cinemaId: "asd"
            });


            // TODO: Add your database save logic here
            // For example:
            // const savedKinosaal = await db.kinosaal.create({
            //     data: { name, sitze }
            // });

            return { success: true };
        } catch (error) {
            return fail(500, {
                name,
                error: 'Failed to save Kinosaal'
            });
        }
    }
} satisfies Actions;