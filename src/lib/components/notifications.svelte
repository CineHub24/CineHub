<!-- HOW TO USE
<script>
  import { showNotification } from '$lib/stores/notification';

  function handleClick() {
    showNotification("Hallo! Dies ist eine Popup-Nachricht.");
  }
</script>

<button on:click={handleClick}>Zeige Popup</button>
-->

<script lang="ts">
    import { notification } from '../stores/notification.js';
    import { fly } from 'svelte/transition';
  
    let message: string | null = null;
    const unsubscribe = notification.subscribe(value => {
      message = value;
    });
  </script>
  
  {#if message}
    <div class="notification-overlay" transition:fly={{ y: -20, duration: 200 }}>
      <div class="notification-content">
        {message}
      </div>
    </div>
  {/if}
  
  <style>
    .notification-overlay {
      position: fixed;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: #fff;
      padding: 1rem 2rem;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      z-index: 9999;
    }
  </style>
