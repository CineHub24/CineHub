<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
    import { writable } from 'svelte/store';

    interface Sitz {
        sitznummer: number;
        reihe: number;
        spalte: number;
        buchbar: boolean;
    }

    interface Kinosaal {
        hallNumber: string;
        sitze: Sitz[];
    }

    export let sitze = writable<Sitz[]>([
        {
        sitznummer: 0,
        reihe: 0,
        spalte: 1,
        buchbar: true
    }]);

    export let kinosaal = writable<Kinosaal>({
        hallNumber: '',
        sitze: []
    });

    let isSaving = false;
    let saveError: string | null = null;

    let nextSitznummer = 0;

    function addRow() {
        const currentMaxRow = Math.max(...$sitze.map(s => s.reihe), -1);
        const columnCount = Math.max(...$sitze.map(s => s.spalte), 0) + 1;

        const newRowSeats: Sitz[] = Array.from({length: columnCount}, (_, spalte) => ({
            sitznummer: nextSitznummer++,
            reihe: currentMaxRow + 1,
            spalte,
            buchbar: true
        }));

        sitze.update(current => [...current, ...newRowSeats]);
    }

    function addColumn() {
        const currentMaxCol = Math.max(...$sitze.map(s => s.spalte), -1);
        const rowCount = Math.max(...$sitze.map(s => s.reihe), 0) + 1;

        const newColumnSeats: Sitz[] = Array.from({length: rowCount}, (_, reihe) => ({
            sitznummer: nextSitznummer++,
            reihe,
            spalte: currentMaxCol + 1,
            buchbar: true
        }));

        sitze.update(current => [...current, ...newColumnSeats]);
    }

    function addSeat(reihe: number, spalte: number) {
        console.log("sitze")
        sitze.update(current => {
            // Check if seat already exists
            const existingSeat = current.find(s => s.reihe === reihe && s.spalte === spalte);
            if (existingSeat) return current;

            return [...current, {
                sitznummer: nextSitznummer++,
                reihe,
                spalte,
                buchbar: true
            }];
        });
        console.log(sitze)
    }

    function removeSeat(sitznummer: number) {
        sitze.update(current => current.filter(s => s.sitznummer !== sitznummer));
    }

    $: maxRow = Math.max(...$sitze.map(s => s.reihe), -1);
    $: maxCol = Math.max(...$sitze.map(s => s.spalte), -1);


    const handleSubmit: SubmitFunction = ({ formElement, formData, action, cancel }) => {
        // Optional client-side enhancement
        return async ({ result, update }) => {
            if (result.type === 'success') {
                // Handle successful submission
            }
        };
    };
</script>

<div class="seat-grid-editor">
    <form method="POST" action="?/saveKinosaal" use:enhance={handleSubmit}>

    <div class="kinosaal-name">
        <label for="kinosaal-number">Kinosaal Name:</label>
        <input 
            type="text" 
            name="hall-number" 
            id="hall-number"
            bind:value={$kinosaal.hallNumber}
            placeholder="Enter Kinosaal nummer"
        />
    </div>
    
    <div class="grid">
        {#each Array(maxRow + 1) as _, row}
            <div class="seat-row">
                {#each Array(maxCol + 1) as _, col}
                    {@const seat = $sitze.find(s => s.reihe === row && s.spalte === col)}
                    {#if seat}
                        <div class="seat-container">
                            <button 
                                class="seat" 
                                class:available={seat.buchbar}
                            >
                                {seat.sitznummer}
                            </button>
                            <button 
                                class="remove-seat" 
                                on:click={() => removeSeat(seat.sitznummer)}
                            >
                                ✕
                            </button>
                        </div>
                    {:else}
                        <button 
                            class="add-seat" 
                            on:click={() => addSeat(row, col)}
                        >
                            +
                        </button>
                    {/if}
                {/each}
            </div>
        {/each}
    </div>

    <div class="controls">
        <button on:click={addRow}>Add Row</button>
        <button on:click={addColumn}>Add Column</button>

        <input 
        type="hidden" 
        name="sitze" 
        value={JSON.stringify($sitze)} 
        />

        <button type="submit" on:click={() => console.log($sitze)}>Save Kinosaal</button>
        
    </div>

    {#if saveError}
        <div class="error-message">
            {saveError}
        </div>
    {/if}

    </form>
</div>

<style>
    .seat-grid-editor {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }

    .grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .seat-row {
        display: flex;
        gap: 10px;
    }

    .seat-container {
        position: relative;
    }

    .seat {
        width: 50px;
        height: 50px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .remove-seat {
        position: absolute;
        top: -10px;
        right: -10px;
        background-color: red;
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .add-seat {
        width: 50px;
        height: 50px;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .controls {
        display: flex;
        gap: 10px;
    }

    .controls button {
        padding: 10px;
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
</style>