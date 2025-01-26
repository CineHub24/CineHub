import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSSEManager } from '$lib/utils/sseManager';

// Mock EventSource
class MockEventSource {
	onopen: (() => void) | null = null;
	onmessage: ((event: any) => void) | null = null;
	onerror: ((error: any) => void) | null = null;
	addEventListener: (event: string, callback: (event: any) => void) => void;
	close: () => void;

	constructor(public url: string) {
		this.addEventListener = vi.fn();
		this.close = vi.fn();
	}
}

describe('createSSEManager', () => {
	const showingId = 123;
	const onUpdate = vi.fn();
	const onStatusChange = vi.fn();
	let sseManager: ReturnType<typeof createSSEManager>;
	let mockEventSource: MockEventSource;

	beforeEach(() => {
		vi.useFakeTimers();
		mockEventSource = new MockEventSource(`/api/seats/${showingId}/stream`);
		vi.stubGlobal(
			'EventSource',
			vi.fn(() => mockEventSource)
		);
		sseManager = createSSEManager(showingId, onUpdate, onStatusChange);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	it('should connect to the correct URL', () => {
		sseManager.connect();
		expect(mockEventSource.url).toBe(`/api/seats/${showingId}/stream`);
	});

	it('should call onStatusChange with connected status on open', () => {
		sseManager.connect();
		mockEventSource.onopen!();
		expect(onStatusChange).toHaveBeenCalledWith({
			connectionStatus: 'connected',
			connectionError: null,
			retryCount: 0
		});
	});

	it('should call onUpdate when receiving a message', () => {
		sseManager.connect();
		const mockData = [{ id: 1, status: 'available' }];
		mockEventSource.onmessage!({ data: JSON.stringify(mockData) } as MessageEvent);
		expect(onUpdate).toHaveBeenCalledWith(mockData);
	});

	it('should retry connection on error', () => {
		sseManager.connect();
		mockEventSource.onerror!(new Event('error'));

		expect(onStatusChange).toHaveBeenCalledWith(
			expect.objectContaining({
				connectionStatus: 'error',
				connectionError: expect.stringContaining('Retrying in'),
				retryCount: 1
			})
		);

		vi.runAllTimers();
		expect(EventSource).toHaveBeenCalledTimes(2);
	});

	it('should stop retrying after max attempts', () => {
		const options = {
			maxRetries: 5,
			baseRetryDelay: 1000,
			maxRetryDelay: 10000
		};
		sseManager = createSSEManager(showingId, onUpdate, onStatusChange, options);

		sseManager.connect();

		for (let i = 0; i <= options.maxRetries; i++) {
			mockEventSource.onerror!(new Event('error'));
			vi.runAllTimers();
		}

		expect(onStatusChange).toHaveBeenLastCalledWith({
			connectionStatus: 'failed',
			connectionError: 'Failed to connect after multiple attempts',
			retryCount: options.maxRetries
		});
	});

	it('should clean up on disconnect', () => {
		sseManager.connect();
		sseManager.disconnect();
		expect(mockEventSource.close).toHaveBeenCalled();
	});
});
