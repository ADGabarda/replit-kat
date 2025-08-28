interface NotificationSettings {
  dueNotifications: boolean;
  failedNotifications: boolean;
}

const STORAGE_KEY = 'postpilot_notifications';

export function getNotificationSettings(): NotificationSettings {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    dueNotifications: true,
    failedNotifications: true
  };
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function shouldShowDueNotification(): boolean {
  return getNotificationSettings().dueNotifications;
}

export function shouldShowFailedNotification(): boolean {
  return getNotificationSettings().failedNotifications;
}