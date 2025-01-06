<!-- HOW TO USE THIS BUTTON

<script lang="ts">
  import button from '../components/button.svelte';
</script>

<button type="submit" onClick={() => console.log('Submitted')}>
  Submit
</button>

-->

<script lang="ts">
    export let type: 'button' | 'submit' | 'reset' = 'button';
    export let onClick: () => void = () => {};
    export let disabled: boolean = false;
  </script>
  
  <style>
    button {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.2s ease-in-out;
    }
  
    button:hover {
      background-color: #0056b3;
    }
  
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  </style>
  
  <button type={type} on:click={onClick} disabled={disabled}>
    <slot />
  </button>