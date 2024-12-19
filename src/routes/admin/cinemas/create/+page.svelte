<script>
    import GoogleAutocomplete from '$lib/components/GoogleAutocomplete.svelte';
    
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    function handlePlaceSelected(event) {
      const adresse = event.detail;
      console.log('Gewählte Adresse:', adresse);
    }
  </script>
  
  <GoogleAutocomplete
    apiKey={API_KEY}
    placeholder="Adresse suchen"
    on:place-selected={handlePlaceSelected}
  />
 