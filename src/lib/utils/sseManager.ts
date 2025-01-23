export function createSSEManager(
	showingId: number,
	onUpdate: (seatStatus: any[]) => void,
	onStatusChange: (status: {
		connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' | 'failed';
		connectionError: string | null;
		retryCount: number;
	}) => void,
	options = {
		maxRetries: 5,
		baseRetryDelay: 1000,
		maxRetryDelay: 10000
	}
) {
	let eventSource: EventSource | null = null;
	let retryCount = 0;
	let reconnectTimeout: number | null = null;

	function connect() {
		cleanup();

		try {
			const url = `/api/seats/${showingId}/stream`;
			// console.log('Connecting to SSE:', { url, retryCount });

			eventSource = new EventSource(url);
			onStatusChange({
				connectionStatus: 'connecting',
				connectionError: null,
				retryCount
			});

			eventSource.onopen = () => {
				// console.log('SSE connection opened');
				onStatusChange({
					connectionStatus: 'connected',
					connectionError: null,
					retryCount: 0
				});
				retryCount = 0;
			};

			eventSource.onmessage = (event) => {
				try {
					console.log('SSE message received:', event.data);
					const data = JSON.parse(event.data);
					onUpdate(data);
				} catch (error) {
					console.error('Error processing message:', error);
				}
			};

			eventSource.addEventListener('seats', (event) => {
				try {
					const data = JSON.parse(event.data);
					onUpdate(data);
				} catch (error) {
					console.error('Error processing seats update:', error);
				}
			});

			eventSource.onerror = (error) => {
				console.error('SSE error:', error);
				cleanup();

				if (retryCount >= options.maxRetries) {
					onStatusChange({
						connectionStatus: 'failed',
						connectionError: 'Failed to connect after multiple attempts',
						retryCount
					});
					return;
				}

				retryCount++;
				const delay = Math.min(
					options.baseRetryDelay * Math.pow(2, retryCount),
					options.maxRetryDelay
				);

				onStatusChange({
					connectionStatus: 'error',
					connectionError: `Connection lost. Retrying in ${Math.round(delay / 1000)}s...`,
					retryCount
				});

				reconnectTimeout = window.setTimeout(connect, delay);
			};
		} catch (error) {
			console.error('Error initializing SSE:', error);
			onStatusChange({
				connectionStatus: 'error',
				connectionError: 'Failed to initialize connection',
				retryCount
			});
		}
	}

	function cleanup() {
		if (eventSource) {
			console.log('Cleaning up SSE connection');
			eventSource.close();
			eventSource = null;
		}
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
	}

	return {
		connect,
		disconnect: cleanup,
		reconnect: connect
	};
}
