// src/routes/api/seats/[showingId]/stream/+server.ts
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { booking, ticket } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { clients, CONFIG, cleanup, encodeSSE } from '$lib/server/sse';

export async function GET({ params }: RequestEvent) {
    const showingId = params.showingId;

    console.log('SSE connection request received:', {
        showingId,
        timestamp: new Date().toISOString()
    });

    if (!showingId) {
        throw error(400, 'Missing showingId parameter');
    }

    if (!clients.has(showingId)) {
        clients.set(showingId, new Set());
    }
    const showingClients = clients.get(showingId)!;

    if (showingClients.size >= CONFIG.MAX_CLIENTS_PER_SHOWING) {
        throw error(503, 'Too many connections for this showing');
    }

    let controller: ReadableStreamController<Uint8Array>;

    const stream = new ReadableStream({
        start: async (_controller) => {
            controller = _controller;
            const client = {
                controller,
                keepAliveInterval: setInterval(() => { }, 0), // Placeholder
                connectedAt: new Date()
            };

            try {
                controller.enqueue(new TextEncoder().encode(`retry: ${CONFIG.RETRY_INTERVAL}\n\n`));
                controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));

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

                const message = encodeSSE('seats', seatStatus);

                client.controller.enqueue(new TextEncoder().encode(message));

                client.keepAliveInterval = setInterval(() => {
                    try {
                        if (Date.now() - client.connectedAt.getTime() > CONFIG.CONNECTION_TIMEOUT) {
                            throw new Error('Connection timeout');
                        }
                        controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
                    } catch (error) {
                        console.error('Error sending keep-alive, closing connection:', error);
                        cleanup(showingId, client);
                    }
                }, CONFIG.KEEP_ALIVE_INTERVAL);

                showingClients.add(client);
                console.log(`Client connected to showing ${showingId}, total clients: ${showingClients.size}`);

            } catch (error) {
                console.error('Error during SSE stream initialization:', error);
                cleanup(showingId, client);
                controller.error(error);
            }
        },
        cancel() {
            const client = Array.from(showingClients).find(c => c.controller === controller);
            if (client) {
                cleanup(showingId, client);
            }
        }
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },

    });
}