export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  showOncePerSession: boolean;
  createdAt: Date;
  updatedAt: Date;
  shownToUsers: string[];
}

const NOTIFICATION_KEY = 'app_notifications';

export function getUserId(): string {
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_id', userId);
  }
  return userId;
}

export function saveNotifications(notifications: AppNotification[]): void {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
}

export function loadNotifications(): AppNotification[] {
  const stored = localStorage.getItem(NOTIFICATION_KEY);
  if (!stored) {
    const defaultNotification: AppNotification = {
      id: 'default',
      title: 'Bem-vindo! 👋',
      message: 'Obrigado por usar nosso aplicativo! Aqui você encontrará receitas fitness deliciosas e produtos saudáveis.',
      isActive: false,
      showOncePerSession: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      shownToUsers: [],
    };
    saveNotifications([defaultNotification]);
    return [defaultNotification];
  }
  try {
    const parsed = JSON.parse(stored);
    return parsed.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
      updatedAt: new Date(n.updatedAt),
    }));
  } catch {
    return [];
  }
}

export function getActiveNotification(): AppNotification | null {
  const notifications = loadNotifications();
  return notifications.find(n => n.isActive) || null;
}

export function hasUserSeenNotification(userId: string, notificationId: string): boolean {
  const notifications = loadNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (!notification || !notification.showOncePerSession) return false;
  return notification.shownToUsers.includes(userId);
}

export function markNotificationAsSeen(userId: string, notificationId: string): void {
  const notifications = loadNotifications();
  const notificationIndex = notifications.findIndex(n => n.id === notificationId);
  if (notificationIndex !== -1) {
    const notification = notifications[notificationIndex];
    if (!notification.shownToUsers.includes(userId)) {
      notification.shownToUsers.push(userId);
      notification.updatedAt = new Date();
      notifications[notificationIndex] = notification;
      saveNotifications(notifications);
    }
  }
}

// NOVA FUNÇÃO: Resetar visualizações de uma notificação
export function resetNotificationViews(notificationId: string): void {
  const notifications = loadNotifications();
  const notificationIndex = notifications.findIndex(n => n.id === notificationId);
  
  if (notificationIndex !== -1) {
    notifications[notificationIndex].shownToUsers = [];
    notifications[notificationIndex].updatedAt = new Date();
    saveNotifications(notifications);
  }
}

// NOVA FUNÇÃO: Ativar notificação e resetar visualizações
export function activateNotification(notificationId: string): void {
  const notifications = loadNotifications();
  
  // Primeiro desativa todas as notificações
  const updatedNotifications = notifications.map(n => ({
    ...n,
    isActive: n.id === notificationId,
    // Reseta as visualizações apenas para a notificação que está sendo ativada
    shownToUsers: n.id === notificationId ? [] : n.shownToUsers,
  }));
  
  saveNotifications(updatedNotifications);
}

export function shouldShowNotification(): boolean {
  const activeNotification = getActiveNotification();
  if (!activeNotification || !activeNotification.isActive) return false;
  const userId = getUserId();
  if (activeNotification.showOncePerSession) {
    const hasSeen = hasUserSeenNotification(userId, activeNotification.id);
    return !hasSeen;
  }
  return true;
}