// src/lib/server/sse.ts
import { db } from '$lib/server/db';
import { booking, ticket } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

interface Client {
    controller: ReadableStreamController<Uint8Array>;
    keepAliveInterval: NodeJS.Timeout;
    connectedAt: Date;
}

export const clients = new Map<string, Set<Client>>();

export const CONFIG = {
    KEEP_ALIVE_INTERVAL: 30000,
    MAX_CLIENTS_PER_SHOWING: 150,
    CONNECTION_TIMEOUT: 2 * 60 * 60 * 1000, // 2h
    RETRY_INTERVAL: 2000
} as const;

export function encodeSSE(event: string, data: any) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function cleanup(showingId: string, client: Client) {
    const showingClients = clients.get(showingId);
    if (showingClients) {
        clearInterval(client.keepAliveInterval);
        showingClients.delete(client);
        if (showingClients.size === 0) {
            clients.delete(showingId);
        }
        // console.log(`Client disconnected from showing ${showingId}, remaining clients: ${showingClients.size}`);
    }
}

export async function notifySeatChange(showingId: string) {
    // console.log('Sending seat update via SSE');
    const showingClients = clients.get(showingId);
    if (!showingClients?.size) return;

    try {
        const ticketsWithUsers = await db
            .select({
                id: ticket.id,
                seatId: ticket.seatId,
                status: ticket.status,
                userId: booking.userId
            })
            .from(ticket)
            .leftJoin(booking, eq(ticket.bookingId, booking.id))
            .where(eq(ticket.showingId, parseInt(showingId)));

        const seatStatus = ticketsWithUsers.map((t) => ({
            id: t.id,
            seatId: t.seatId,
            status: t.status,
            userId: t.userId
        }));

        // console.log('Seat status:', seatStatus);

        const message = encodeSSE('seats', seatStatus);
        const deadClients = new Set<Client>();

        for (const client of showingClients) {
            try {
                // console.log('Sending seat update:', {
                //     type: 'seats',
                //     data: seatStatus,
                //     timestamp: new Date().toISOString()
                // });
                client.controller.enqueue(new TextEncoder().encode(message));
            } catch (error) {
                console.error('Error sending to client, marking for cleanup:', error);
                deadClients.add(client);
            }
        }

        for (const client of deadClients) {
            cleanup(showingId, client);
        }
    } catch (error) {
        console.error('Error sending seat update:', error);
    }
}
