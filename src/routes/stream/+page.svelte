<script>
    import { onMount, onDestroy } from 'svelte';
    let numbers = [];
    let reader;
    let isStreaming = false;

    async function startStream() {
        isStreaming = true;
        try {
            const response = await fetch('/api/stream');
            reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (isStreaming) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const number = decoder.decode(value).trim();
                numbers = [...numbers, number];
            }
        } catch (error) {
            console.error('Stream error:', error);
        }
    }

    function stopStream() {
        isStreaming = false;
        if (reader) {
            reader.cancel();
        }
    }

    onMount(() => {
        startStream();
    });

    onDestroy(() => {
        stopStream();
    });
</script>

<div class="container">
    <h2>Random Numbers Stream</h2>
    
    <div class="status">
        Stream status: {isStreaming ? 'Connected' : 'Disconnected'}
    </div>

    <button on:click={isStreaming ? stopStream : startStream}>
        {isStreaming ? 'Stop Stream' : 'Start Stream'}
    </button>

    <div class="numbers">
        <h3>Received Numbers:</h3>
        {#each numbers as number}
            <div class="number">{number}</div>
        {/each}
    </div>
</div>

<style>
    .container {
        padding: 20px;
        max-width: 600px;
        margin: 0 auto;
    }

    .status {
        margin: 20px 0;
        padding: 10px;
        background-color: #f0f0f0;
        border-radius: 4px;
    }

    .numbers {
        margin-top: 20px;
    }

    .number {
        padding: 10px;
        margin: 5px 0;
        background-color: #e0e0e0;
        border-radius: 4px;
    }

    button {
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #45a049;
    }
</style>