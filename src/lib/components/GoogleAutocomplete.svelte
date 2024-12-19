<!-- GoogleAutocomplete.svelte -->
<script>
    import { onMount, createEventDispatcher } from 'svelte';
    
    export let apiKey = '';
    export let placeholder = 'Enter an address';
    export let inputClass = '';
    
    let input;
    let autocomplete;
    let loaded = false;
    
    const dispatch = createEventDispatcher();
    
    onMount(() => {
      // Load Google Places API script
      if (!document.querySelector('#google-places-script')) {
        const script = document.createElement('script');
        script.id = 'google-places-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          loaded = true;
          initAutocomplete();
        };
        
        document.head.appendChild(script);
      } else if (window.google) {
        loaded = true;
        initAutocomplete();
      }
    });
    
    function initAutocomplete() {
      if (!input || !loaded) return;
      
      autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['address'],
        componentRestrictions: { country: 'de' } // Set to Germany
      });
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
          dispatch('error', { message: 'No details available for this place' });
          return;
        }
        
        const addressComponents = {
          hausnummer: '',           // street_number
          strasse: '',              // route
          stadt: '',                // locality
          bundesland: '',           // administrative_area_level_1
          plz: '',                  // postal_code
          formatted_address: place.formatted_address,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng()
        };
        
        for (const component of place.address_components) {
          const type = component.types[0];
          switch(type) {
            case 'street_number':
              addressComponents.hausnummer = component.long_name;
              break;
            case 'route':
              addressComponents.strasse = component.long_name;
              break;
            case 'locality':
              addressComponents.stadt = component.long_name;
              break;
            case 'administrative_area_level_1':
              addressComponents.bundesland = component.long_name;
              break;
            case 'postal_code':
              addressComponents.plz = component.long_name;
              break;
          }
        }
        
        dispatch('place-selected', addressComponents);
      });
    }
    
    function handleFocus() {
      dispatch('focus');
    }
    
    function handleBlur() {
      dispatch('blur');
    }
  </script>
  
  <div class="google-autocomplete-wrapper">
    <input
      bind:this={input}
      type="text"
      {placeholder}
      class={`google-autocomplete-input ${inputClass}`}
      on:focus={handleFocus}
      on:blur={handleBlur}
    />
  </div>
  
  <style>
    .google-autocomplete-wrapper {
      position: relative;
      width: 100%;
    }
    
    .google-autocomplete-input {
      width: 100%;
      padding: 8px 12px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    
    .google-autocomplete-input:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
    
    :global(.pac-container) {
      border-radius: 4px;
      margin-top: 4px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
  </style>