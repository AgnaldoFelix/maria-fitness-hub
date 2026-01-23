export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  showOncePerSession: boolean;
  createdAt: Date;
  updatedAt: Date;
  shownToUsers: string[]; // IDs dos usuários que já viram (se showOncePerSession = true)
}

export interface UserSession {
  userId: string;
  lastNotificationSeen?: string;
  sessionStart: Date;
}