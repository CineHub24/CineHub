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
  in:fly={{ x: 100, y: -100, duration: 500, opacity: 0 }}
  out:fly={{ x: 100, y: -100, duration: 300 }}
  >
  <div class="notification-content">
  <span class="icon">{icon}</span>
  {notificationData.message}
  </div>
  <button class="close-button" on:click={closeNotification}>×</button>
  </div>
  {/if}
  
  <style>
  .notification-overlay {
  position: fixed;
  top: 1rem;
  right: 1rem;
  max-width: 400px;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 9999;
  border: 1px solid;
  }
  
  .notification-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  }
  
  .icon {
  font-size: 1.1rem;
  }
  
  .close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
  margin-left: 1rem;
  opacity: 0.6;
  transition: opacity 0.2s;
  }
  
  .close-button:hover {
  opacity: 1;
  }
  
  /* Type-specific styles */
  .info {
  border-color: #3498db;
  color: #2980b9;
  }
  
  .alert {
  border-color: #f1c40f;
  color: #f39c12;
  }
  
  .success {
  border-color: #2ecc71;
  color: #27ae60;
  }
  
  .error {
  border-color: #e74c3c;
  color: #c0392b;
  }
  </style>