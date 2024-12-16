<script lang="ts">
    let selectedPriceSet: typeof priceSets[0] | null;
    let isCreatingNewPriceSet = false;
    export let data;
    const {priceSets, seatCategories, ticketTypes} = data;

    let newPriceSet = {
        name: '',
        priceFactor: '1',
        seatCategoryPrices: [1,2,3,4,5] as number[],
        ticketTypes: [1,2,3,4,5] as number[]
    };
    
    function handleEdit(priceSet: typeof priceSets[0]) {
        selectedPriceSet = priceSet;
    }
    
    function getPriceSetDetails(set: typeof priceSets[0]) {
        const appliedSeatCategories = set.seatCategoryPrices
        .map(id => seatCategories.find(category => category.id === id))
        .filter(Boolean);
    
        const appliedTicketTypes = set.ticketTypes
        .map(id => ticketTypes.find(type => type.id === id))
        .filter(Boolean);
    
        return { appliedSeatCategories, appliedTicketTypes };
    }

    function startNewPriceSet() {
        newPriceSet = {
            name: '',
            priceFactor: '1',
            seatCategoryPrices: [],
            ticketTypes: []
        };
        isCreatingNewPriceSet = true;
    }
    function cancelEdit() {
        isCreatingNewPriceSet = false;
        selectedPriceSet = null;
    }
</script>
<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    .page-title {
        font-size: 2.5rem;
        color: #333;
        margin-bottom: 2rem;
        border-bottom: 2px solid #4a4a4a;
        padding-bottom: 0.5rem;
    }
    
    .new-priceset-btn {
        display: inline-block;
        background-color: #2c3e50;
        color: white;
        padding: 0.75rem 1.5rem;
        text-decoration: none;
        border-radius: 5px;
        margin-bottom: 1.5rem;
        transition: background-color 0.3s ease;
    }
    
    .new-priceset-btn:hover {
        background-color: #34495e;
    }
    
    .priceset-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    .priceset-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .priceset-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    
    .priceset-title {
        font-size: 1.5rem;
        color: #2c3e50;
        margin-bottom: 1rem;
        font-weight: 600;
    }
    
    .priceset-detail {
        margin-bottom: 1rem;
    }
    
    .priceset-detail strong {
        color: #34495e;
        display: block;
        margin-bottom: 0.5rem;
    }
    
    .priceset-detail ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
    
    .priceset-detail ul li {
        background-color: #f4f6f7;
        padding: 0.3rem 0.5rem;
        margin-bottom: 0.25rem;
        border-radius: 3px;
        color: #2c3e50;
    }
    
    .card-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 1rem;
    }
    
    .btn {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        transition: background-color 0.3s ease;
    }
    
    .btn-edit {
        background-color: #3498db;
        color: white;
    }
    
    .btn-edit:hover {
        background-color: #2980b9;
    }
    
    .btn-delete {
        background-color: #e74c3c;
        color: white;
    }
    
    .btn-delete:hover {
        background-color: #c0392b;
    }
</style>
    <div class="container">
    <h1 class="page-title">Preissets Verwaltung</h1>
    {#if !isCreatingNewPriceSet}
        <button class="new-priceset-btn" on:click={startNewPriceSet}>Neues Preisset anlegen</button>
    {/if}
    
    <div class="priceset-grid">
        {#if isCreatingNewPriceSet}
            <div class="priceset-card">
                <h2 class="priceset-title">Neues Preisset</h2>
                
                <input 
                    class="form-input" 
                    placeholder="Name des Preissets" 
                    bind:value={newPriceSet.name}
                />
                
                <input 
                    class="form-input" 
                    type="number" 
                    step="0.01" 
                    placeholder="Preisfaktor (z.B. 1.0)" 
                    bind:value={newPriceSet.priceFactor}
                />
                
                <div class="priceset-detail">
                    <strong>Sitzkategorien auswählen:</strong>
                    <select 
                        multiple 
                        class="form-input"
                        bind:value={newPriceSet.seatCategoryPrices}
                    >
                        {#each seatCategories as category}
                            <option value={category.id}>{category.name} (€{category.price})</option>
                        {/each}
                    </select>
                </div>
                
                <div class="priceset-detail">
                    <strong>Tickettypen auswählen:</strong>
                    <select 
                        multiple 
                        class="form-input"
                        bind:value={newPriceSet.ticketTypes}
                    >
                        {#each ticketTypes as type}
                            <option value={type.id}>{type.name} ({Math.round(parseFloat(type.factor ?? '1') * 100)}%)</option>
                        {/each}
                    </select>
                </div>
                
                <div class="form-actions">
                    <button class="btn btn-edit">Speichern</button>
                    <button class="btn btn-delete" on:click={cancelEdit}>Abbrechen</button>
                </div>
            </div>
        {/if}
        {#each priceSets as priceSet}
        {@const { appliedSeatCategories, appliedTicketTypes } = getPriceSetDetails(priceSet)}
        <div class="priceset-card">
            {#if selectedPriceSet === priceSet}
                    <input 
                        class="form-input" 
                        bind:value={priceSet.name}
                        placeholder="Name des Preissets"
                    />
                    
                    <input 
                        class="form-input" 
                        type="number" 
                        step="0.01" 
                        bind:value={priceSet.priceFactor}
                        placeholder="Preisfaktor"
                    />
                    
                    <div class="priceset-detail">
                        <strong>Sitzkategorien:</strong>
                        <select 
                            multiple 
                            class="form-input"
                            bind:value={priceSet.seatCategoryPrices}
                        >
                            {#each seatCategories as category}
                                <option value={category.id}>{category.name} (€{category.price})</option>
                            {/each}
                        </select>
                    </div>
                    
                    <div class="priceset-detail">
                        <strong>Tickettypen:</strong>
                        <select 
                            multiple 
                            class="form-input"
                            bind:value={priceSet.ticketTypes}
                        >
                            {#each ticketTypes as type}
                                <option value={type.id}>{type.name} ({Math.round(parseFloat(type.factor ?? '1') * 100)}%)</option>
                            {/each}
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-edit" >Speichern</button>
                        <button class="btn btn-delete" on:click={cancelEdit} >Abbrechen</button>
                    </div>
                {:else}
                    <h2 class="priceset-title">{priceSet.name}</h2>
                    <p>Preisfaktor auf Basispreise: {Math.round(parseFloat(priceSet.priceFactor ?? '1') * 100)}%</p>
                    
                    <div class="priceset-detail">
                        <strong>Sitzkategorien inkl. Basispreise:</strong>
                        <ul>
                        {#each appliedSeatCategories as category}
                            {#if category }
                                <li>{category.name}: {category.price}€</li>
                            {/if}
                        {/each}
                        </ul>
                    </div>
                    
                    <div class="priceset-detail">
                        <strong>Tickettypen inkl. Preisfaktoren:</strong>
                        <ul>
                            {#each appliedTicketTypes as type}
                                {#if type}
                                    <li>{type.name}: {Math.round(parseFloat(type.factor ?? '1') * 100)}%</li>
                                {/if}
                            {/each}
                        </ul>
                    </div>
            
                    <div class="card-actions">
                        <button 
                            class="btn btn-edit" 
                            on:click={() => handleEdit(priceSet)}
                        >
                            Bearbeiten
                        </button>
                        <button 
                        class="btn btn-delete" 
                        on:click={() => {
                            if (confirm('Sind Sie sicher, dass Sie dieses Preisset löschen möchten?')) {
                            // Hier würde der Löschvorgang an den Server gesendet
                            }
                        }}
                        >
                        Löschen
                        </button>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
    </div>