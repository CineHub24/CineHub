<script lang="ts">
  import { notification } from '$lib/stores/notification';
  import { fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';

  let message: string | null = null;
  
  const unsubscribe = notification.subscribe(value => {
    console.log('Neue Nachricht:', value); // Diese Zeile sollte die Nachricht loggen
    message = value;
  });

  onDestroy(() => {
    unsubscribe(); // Abonnement beim Zerstören der Komponente aufheben
  });
</script>

{#if message}
  <div class="notification-overlay" transition:fly={{ y: 100, duration: 500 }}>
    <div class="notification-content">
      {message}
    </div>
  </div>
{/if}

<style>
  .notification-overlay {
    position: fixed;
    bottom: 1rem; /* Positionieren Sie es am unteren Rand */
    left: 50%;
    transform: translateX(-50%);
    background: #f0f0f0; /* Heller Hintergrund für den Light Mode */
    color: #333; /* Dunkle Textfarbe */
    padding: 0.75rem;
    border-radius: 8px; /* Abgerundete Ecken */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Leichter Schatten */
    z-index: 9999;
    font-size: 1rem;
    border: 1px solid #ccc; /* Rand um die Benachrichtigung */
  }

  .notification-content {
    font-weight: normal; /* Kein fetter Text */
  }
</style>
