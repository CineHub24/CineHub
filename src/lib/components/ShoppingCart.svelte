<script lang="ts">
    import { ShoppingCart } from 'lucide-svelte';
    import { onDestroy, onMount } from 'svelte';
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';

    let timeLeft = 0;
    let isRunning = false;
    let intervalId: ReturnType<typeof setInterval>;
    let error: string | null = null;

    async function loadCartData() {
        try {
            const response = await fetch('/api/cart-timer');
            const data = await response.json();
            
            if (data.timeLeft) {
                timeLeft = data.timeLeft;
                isRunning = true;
                startTimer();
            }
        } catch (e) {
            console.error('Error loading cart data:', e);
            error = 'Failed to load cart timer';
        }
    }

    function startTimer() {
        clearInterval(intervalId);
        if (isRunning && timeLeft > 0) {
            intervalId = setInterval(() => {
                timeLeft -= 1;
                if (timeLeft <= 0) {
                    isRunning = false;
                    clearInterval(intervalId);
                    invalidate('cart:timer');  // Trigger a refresh of cart data
                }
            }, 1000);
        }
    }

    function formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    $: timerColor = timeLeft > 300 ? 'text-green-500' : 
                    timeLeft > 120 ? 'text-yellow-500' : 
                    'text-red-500';

    onMount(() => {
        loadCartData();
        
        // Refresh cart data every minute
        const refreshInterval = setInterval(loadCartData, 60000);
        
        return () => {
            clearInterval(refreshInterval);
        };
    });

    onDestroy(() => {
        clearInterval(intervalId);
    });
</script>

<div class="relative group">
    <a href="/cart" class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
        <div class="relative">
            <ShoppingCart class="h-6 w-6 text-gray-700" />
            {#if timeLeft > 0}
                <div class="absolute -top-2 -right-2 {timerColor} text-xs font-medium">
                    {formatTime(timeLeft)}
                </div>
            {/if}
        </div>
    </a>
    
    {#if timeLeft > 0}
        <div class="absolute hidden group-hover:block top-full right-0 mt-2 p-2 bg-white shadow-lg rounded-md text-sm w-48 z-50">
            <p>Reserved tickets expire in {formatTime(timeLeft)}</p>
        </div>
    {/if}
</div>