<script lang="ts">
    import GoogleAutocomplete from '$lib/components/GoogleAutocomplete.svelte';
    import { email_address } from '$lib/paraglide/messages';
	
	import type { ActionData } from './$types';
    
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    let adress = $state('');
    let {form}:{form: ActionData} = $props();
    function handlePlaceSelected(event) {
        const adresse = event.detail;
        adress = adresse.formatted_address;
        console.log('Gewählte Adresse:', adresse);
    }
</script>

<div class="form-container">
    <form action="?/create" method="POST" class="styled-form">
        <div class="form-columns">
            <div class="form-column">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" required />
                </div>
                
                <div class="form-group">
                    <label for="address">Adresse:</label>
                    <GoogleAutocomplete
                        apiKey={API_KEY}
                        placeholder="Adresse suchen"
                        on:place-selected={handlePlaceSelected}
                    />
                    <input type="hidden" name="adress" value={adress}/>
                </div>
            </div>
            
            <div class="form-column">
                <div class="form-group">
                    <label for="opening_time">Öffnungszeit:</label>
                    <input type="time" id="opening_time" name="opening_time" required />
                </div>
                
                <div class="form-group">
                    <label for="closing_time">Schließzeit:</label>
                    <input type="time" id="closing_time" name="closing_time" required />
                </div>
            </div>
        </div>

        <div class="form-actions">
            <button type="submit">Erstellen</button>
        </div>
    </form>
    {#if form?.error}
        <div class="p-4 bg-red-100 text-red-700 rounded mb-4">
            {form.error}
            
        </div>
        {:else if form?.success}
        <div class="p-4 bg-green-100 text-green-700 rounded mb-4">
            {form.success}
        </div>
        
    {/if}
</div>

<style>
    .form-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        background-color: white;
        padding: 40px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
    }

    .styled-form {
        width: 100%;
    }

    .form-columns {
        display: flex;
        gap: 30px;
    }

    .form-column {
        flex: 1;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
    }

    .form-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1em;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 30px;
    }

    .form-actions button {
        padding: 12px 25px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: 0.3s ease;
    }

    .form-actions button:hover {
        background-color: #0056b3;
    }
</style>