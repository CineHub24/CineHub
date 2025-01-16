<!-- HOW TO USE THIS BUTTON

<script lang="ts">
  import Button from '../components/Button.svelte';
</script>

<Button type="submit" onClick={() => console.log('Submitted')}>
  Submit
</Button>

-->

<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled: boolean = false;
  export let variant: 'primary' | 'secondary' = 'primary';
</script>

<button 
  {type} 
  {disabled}
  class="rounded-md px-4 py-2 text-sm font-medium transition-colors
      {variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300' 
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-50'
      }
      disabled:cursor-not-allowed"
  on:click
>
  <slot />
</button>