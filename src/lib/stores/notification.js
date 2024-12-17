import { writable } from 'svelte/store';

export const notification = writable(null);

export function showNotification(message) {
  notification.set(message);
  setTimeout(() => notification.set(null), 3000);
}
