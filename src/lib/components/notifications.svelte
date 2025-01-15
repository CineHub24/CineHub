<script lang="ts">
  import { notification } from '$lib/stores/notification';
  import { fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';
  import type { NotificationData } from '$lib/stores/notification';
  
  let notificationData: NotificationData | null = null;
  
  const unsubscribe = notification.subscribe(value => {
    notificationData = value;
  });
  
  function closeNotification() {
    notification.set(null);
  }
  
  onDestroy(() => {
    unsubscribe();
  });
  
  $: typeClass = notificationData?.type || 'info';
  $: icon = {
    info: '❕',
    alert: '⚠️',
    success: '✅',
    error: '❌'
  }[notificationData?.type || 'info'];
</script>

{#if notificationData}
  <div
    class="notification-overlay {typeClass}"
    in:fly={{ x: 400, duration: 400, opacity: 0 }}
    out:fly={{ x: 400, duration: 300 }}
  >
    <div class="notification-content">
      <span class="icon-wrapper">
        <span class="icon">{icon}</span>
      </span>
      {notificationData.message}
    </div>
    <button class="close-button" on:click={closeNotification}>
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
{/if}

<style>
  .notification-overlay {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    max-width: 400px;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 1);
    backdrop-filter: blur(12px);
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    z-index: 9999;
    font-size: 0.95rem;
    line-height: 1.5;
    border: 2px solid;
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-right: 0.5rem;
  }

  .icon-wrapper {
    background: white;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .icon {
    font-size: 1.1rem;
    display: flex;
    align-items: center;
  }

  .close-button {
    position: absolute;
    top: -0.75rem;
    right: -0.75rem;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: #64748b;
    transition: all 0.2s ease;
    padding: 0;
  }

  .close-button:hover {
    background: #f1f5f9;
    color: #334155;
    transform: scale(1.05);
  }

  /* Type-specific styles */
  .info {
    background: linear-gradient(to right, rgba(221, 221, 222, 0.75), rgba(210, 211, 213, 0.75));
    color: #000000;
    border-color: #a1a1a1;
  }

  .alert {
    background: linear-gradient(to right, rgba(245, 158, 11, 0.5), rgba(245, 158, 11, 0.5));
    color: #000000;
    border-color: #d97706;
  }

  .success {
    background: linear-gradient(to right, rgba(34, 197, 94, 0.5), rgba(34, 197, 94, 0.5));
    color: #000000;
    border-color: #16a34a;
  }

  .error {
    background: linear-gradient(to right, rgba(239, 68, 68, 0.5), rgba(239, 68, 68, 0.5));
    color: #000000;
    border-color: #dc2626;
  }
</style>