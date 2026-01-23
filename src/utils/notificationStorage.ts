import { AppNotification, UserSession } from "@/types";

const NOTIFICATION_KEY = 'app_notifications';
const USER_SESSION_KEY = 'user_session';

// Gera um ID único para o usuário (baseado no navegador)
export function getUserId(): string {
  let userId = localStorage.getItem('user_id');
  
  if (!userId) {
    // Cria um ID único baseado em timestamp + random
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_id', userId);
  }
  
  return userId;
}

// Salva notificações no localStorage
export function saveNotifications(notifications: AppNotification[]): void {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
}

// Carrega notificações do localStorage
export function loadNotifications(): AppNotification[] {
  const stored = localStorage.getItem(NOTIFICATION_KEY);
  
  if (!stored) {
    // Retorna notificação padrão
    const defaultNotification: AppNotification = {
      id: 'default',
      title: 'Bem-vindo! 👋',
      message: 'Obrigado por usar nosso aplicativo! Aqui você encontrará receitas fitness deliciosas e produtos saudáveis.',
      isActive: false, // Começa desativada
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

// Obtém a notificação ativa
export function getActiveNotification(): AppNotification | null {
  const notifications = loadNotifications();
  return notifications.find(n => n.isActive) || null;
}

// Verifica se o usuário já viu a notificação
export function hasUserSeenNotification(userId: string, notificationId: string): boolean {
  const notifications = loadNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (!notification || !notification.showOncePerSession) {
    return false;
  }
  
  return notification.shownToUsers.includes(userId);
}

// Marca notificação como vista pelo usuário
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

// Gerenciamento de sessão do usuário
export function getUserSession(): UserSession {
  const stored = localStorage.getItem(USER_SESSION_KEY);
  const userId = getUserId();
  
  if (!stored) {
    const newSession: UserSession = {
      userId,
      sessionStart: new Date(),
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    const newSession: UserSession = {
      userId,
      sessionStart: new Date(),
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  }
}

// Verifica se precisa mostrar notificação para o usuário atual
export function shouldShowNotification(): boolean {
  const activeNotification = getActiveNotification();
  
  if (!activeNotification || !activeNotification.isActive) {
    return false;
  }
  
  const userId = getUserId();
  
  if (activeNotification.showOncePerSession) {
    // Verifica se já viu nesta sessão
    const hasSeen = hasUserSeenNotification(userId, activeNotification.id);
    return !hasSeen;
  }
  
  return true;
}