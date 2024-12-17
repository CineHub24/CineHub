import { writable } from 'svelte/store';

export const notification = writable(null);

export function showNotification(message) {
  notification.set(message); // Setzt die Nachricht im Store
  setTimeout(() => {
    notification.set(null); // Löscht die Nachricht nach 3 Sekunden
  }, 4000);
}