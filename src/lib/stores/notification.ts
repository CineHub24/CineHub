import { writable } from 'svelte/store';

export type NotificationType = 'info' | 'alert' | 'success' | 'error';

export interface NotificationData {
  message: string;
  type: NotificationType;
}

export const notification = writable<NotificationData | null>(null);

export function showNotification(message: string, type: NotificationType = 'info') {
  notification.set({ message, type });
  setTimeout(() => {
    notification.set(null);
  }, 8000);
}