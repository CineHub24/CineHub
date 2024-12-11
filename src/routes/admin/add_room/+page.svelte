<script lang="ts">
  
    // Initial seat data: an array of rows, each containing seat objects
    let seatPlan : ({
        id: string;
        type: string;
    } | null)[][] = $state([
        [ { id: 'A1', type: 'single' }, { id: 'A2', type: 'single' }, { id: 'A3', type: 'double' }, { id: 'A4', type: 'double' } ],
        [ { id: 'B1', type: 'single' }, { id: 'B2', type: 'single' }, { id: 'B3', type: 'single' }, { id: 'B4', type: 'single' } ],
    ]);
  
    function addRow() {
      const newRowIndex = seatPlan.length;
      const newRow = Array.from({ length: seatPlan[0].length }, (_, i) => ({
        id: `${String.fromCharCode(65 + newRowIndex)}${i + 1}`,
        type: 'single'
      }));
      seatPlan = [...seatPlan, newRow];
    }
  
    function addColumn() {
      seatPlan = seatPlan.map((row, rowIndex) => [
        ...row,
        { id: `${String.fromCharCode(65 + rowIndex)}${row.length + 1}`, type: 'single' }
      ]);
    }

    function removeRow(rowIndex: number) {
      seatPlan = seatPlan.filter((_, rIdx) => rIdx !== rowIndex);
    }

    function removeColumn(colIndex: number) {
      seatPlan = seatPlan.map(row => row.filter((_, cIdx) => cIdx !== colIndex));
    }


    function removeSeat(rowIndex: number, colIndex: number) {
        const updatedPlan = seatPlan.map((row, rIdx) =>
        rIdx === rowIndex
            ? row.map((seat, cIdx) => (cIdx === colIndex ? null : seat))
            : row
        );
        seatPlan = updatedPlan;
    }

    function restoreSeat(rowIndex: number, colIndex: number) {
        const originalId = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
        const updatedPlan = seatPlan.map((row, rIdx) =>
        rIdx === rowIndex
            ? row.map((seat, cIdx) => (cIdx === colIndex ? { id: originalId, type: "single" } : seat))
            : row
        );
        seatPlan = updatedPlan;
    }

    function removeSeatRow(rowIndex: number) {
        const updatedPlan = seatPlan.map((row, rIdx) =>
        rIdx === rowIndex ? row.map(() => null) : row
        );
        seatPlan = updatedPlan;
    }

    function removeSeatColumn(colIndex: number) {
        const updatedPlan = seatPlan.map(row =>
        row.map((seat, cIdx) => (cIdx === colIndex ? null : seat))
        );
        seatPlan = updatedPlan;
    }

    

  </script>

    <style>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        flex-direction: column;
        background-color: #f5f5f5;
    }

    .seat-plan {
        display: grid;
        gap: 5px;
        margin-top: 20px;
    }

    .row {
        display: flex;
        align-items: center;
    }

    .seat {
        width: 50px;
        height: 50px;
        background-color: #ddd;
        border: 1px solid #888;
        text-align: center;
        line-height: 50px;
        margin-right: 5px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
    }

    .seat.double {
        width: 105px; /* Double the width of a single seat plus margin */
        background-color: #bbb;
    }

    button {
        padding: 8px 12px;
        margin: 5px;
        cursor: pointer;
    }
    </style>

  

  <div class="controls">
    <button onclick={addRow}>Add Row</button>
    <button onclick={addColumn}>Add Column</button>
    <button onclick={() => removeRow(seatPlan.length - 1)}>Remove Last Row</button>
    <button onclick={() => removeColumn(seatPlan[0]?.length - 1)}>Remove Last Column</button>
  </div>

  <div class="container">

    {#if seatPlan[0]}
        <div class="column-controls">
        {#each seatPlan[0] as _, colIndex}
            <button onclick={() => removeSeatColumn(colIndex)}>Remove Col {colIndex + 1}</button>
        {/each}
        </div>
    {/if}


    <div class="seat-plan">
      {#each seatPlan as row, rowIndex}
        <div class="row">
          {#each row as seat, colIndex}
            {#if seat}
                <div class="seat" onclick={() => removeSeat(rowIndex, colIndex)}>
                    {seat.id}
                </div>
            {:else}
                <div class="seat placeholder">
                    <button onclick={() => restoreSeat(rowIndex, colIndex)}>Restore</button>
                </div>
            {/if}
          {/each}
          <button onclick={() => removeSeatRow(rowIndex)}>Remove Row {rowIndex + 1}</button>
        </div>
      {/each}
    </div>

   
  </div>
  