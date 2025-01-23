<script lang="ts">
    import { onMount } from 'svelte';
    import { ShoppingCart } from 'lucide-svelte';

    import { timeLeft, isRunning, loadCartData } from '../stores/cartTimeStore';

    // Whenever the component mounts, ensure we load data if needed
    onMount(() => {
        loadCartData(); 
    });

    // Use a reactive statement to derive the color from the current `$timeLeft`
    $: timerColor = (
        $timeLeft > 15 * 60
            ? ''
            : $timeLeft > 10 * 60
                ? 'text-green-500'
                : $timeLeft > 5 * 60
                    ? 'text-yellow-500'
                    : $timeLeft > 2 * 60
                        ? 'text-orange-500'
                        : 'text-red-500'
    );

    // Helper function to format seconds as mm:ss
    function formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds % 60;
        return `${minutes}:${remainder.toString().padStart(2, '0')}`;
    }
</script>

<!-- Example UI -->
<div class="relative group">
    <a href="/cart" class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
        <div class="relative">
            <ShoppingCart class="h-6 w-6 text-gray-700" />
            {#if $timeLeft > 0}
                <div class="absolute -top-3 -right-3 {timerColor} text-xs font-medium">
                    {formatTime($timeLeft)}
                </div>
            {/if}
        </div>
    </a>
    
    {#if $timeLeft > 0}
        <div 
            class="absolute hidden group-hover:block 
                   top-full right-0 mt-2 p-2 bg-white shadow-lg 
                   rounded-md text-sm w-48 z-50"
        >
            <p>Reserved tickets expire in {formatTime($timeLeft)}</p>
        </div>
    {/if}
</div>
