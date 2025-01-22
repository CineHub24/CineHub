// cartTimerStore.ts
import { writable, get } from 'svelte/store';

export const timeLeft = writable(0);        // Total time left in seconds
export const isRunning = writable(false);
export const needsRefresh = writable(false);

// Optional: track errors
export let error: string | null = null;

// We’ll store the interval ID here so we can clear it as needed
let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Fetch cart data from the server and set up the timer
 */
export async function loadCartData() {
    try {
        const response = await fetch('/api/cart-timer');
        const data = await response.json();

        if (data.timeLeft) {
            timeLeft.set(data.timeLeft);
            isRunning.set(true);
            startTimer();
        } else {
            timeLeft.set(0);
            isRunning.set(false);
        }

    } catch (err) {
        console.error('Error loading cart data:', err);
        error = 'Failed to load cart timer';
    }
}

/**
 * Start a countdown timer that decreases `timeLeft` every second
 */
export function startTimer() {
    // Clear any existing timer
    clearInterval(intervalId!);

    if (get(isRunning) && get(timeLeft) > 0) {
        intervalId = setInterval(() => {
            timeLeft.update((current) => {
                if (current <= 0) {
                    isRunning.set(false);
                    clearInterval(intervalId!);
                    return 0;
                }
                return current - 1;
            });
        }, 1000);
    }
}

/**
 * Refresh the cart timer
 */
export function refreshTimer() {
    needsRefresh.set(true);
}

/**
 * Whenever `needsRefresh` is set to true, reload cart data
 */
needsRefresh.subscribe(async () => {
    await loadCartData();
    needsRefresh.set(false);
});
