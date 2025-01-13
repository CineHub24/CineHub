import { db } from '$lib/server/db';
import { ticket } from '$lib/server/db/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import schedule from 'node-schedule';

// Define the job
export const deleteOldReservedTicketsJob = () => {
    // console.log('Scheduling job to delete old reserved tickets');
    schedule.scheduleJob('*/1 * * * *', async () => {
        // console.log('Running job to delete old reserved tickets');

        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        try {
            const oldReservedTickets = await db
                .select()
                .from(ticket)
                .where(
                    and(
                        eq(ticket.status, 'reserved'),
                        lt(ticket.createdAt, fifteenMinutesAgo)
                    )
                );

            // console.log(oldReservedTickets);

            if (oldReservedTickets.length > 0) {
                const deletedCount = await db
                    .delete(ticket)
                    .where(
                        and(
                            eq(ticket.status, 'reserved'),
                            lt(ticket.createdAt, fifteenMinutesAgo)
                        )
                    );

                // console.log(`${deletedCount} old reserved tickets deleted.`);
            } else {
                // console.log('No old reserved tickets found.');
            }
        } catch (error) {
            // console.error('Error running the ticket deletion job:', error);
        }
    });
};

export default deleteOldReservedTicketsJob;