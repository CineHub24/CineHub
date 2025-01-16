export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                while (true) {
                    const randomNumber = Math.floor(Math.random() * 100);
                    controller.enqueue(encoder.encode(`${randomNumber}\n`));
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
            } catch (error) {
                controller.error(error);
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}