// utils/notificationStorage.ts - Versão com debug
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
const DEBUG_KEY = 'notification_debug';

// Função de debug
export function logDebug(message: string, data?: any) {
  const debugLog = localStorage.getItem(DEBUG_KEY) || '[]';
  const logs = JSON.parse(debugLog);
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    message,
    data: data ? JSON.stringify(data) : null
  };
  
  logs.push(logEntry);
  if (logs.length > 50) logs.shift(); // Mantém apenas últimos 50 logs
  
  localStorage.setItem(DEBUG_KEY, JSON.stringify(logs));
  console.log(`🔔 ${message}`, data || '');
}

export function getDebugLogs() {
  const debugLog = localStorage.getItem(DEBUG_KEY) || '[]';
  return JSON.parse(debugLog);
}

export function clearDebugLogs() {
  localStorage.removeItem(DEBUG_KEY);
}

// Gera ID do usuário
export function getUserId(): string {
  let userId = localStorage.getItem('user_id');
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_id', userId);
    logDebug('Novo ID de usuário criado', { userId });
  }
  
  return userId;
}

// Salva notificações
export function saveNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
    logDebug('Notificações salvas', { count: notifications.length });
  } catch (error) {
    console.error('Erro ao salvar notificações:', error);
    logDebug('Erro ao salvar notificações', { error: String(error) });
  }
}

// Carrega notificações
export function loadNotifications(): AppNotification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATION_KEY);
    
    if (!stored) {
      logDebug('Nenhuma notificação encontrada, criando padrão');
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
    
    const parsed = JSON.parse(stored);
    const notifications = parsed.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
      updatedAt: new Date(n.updatedAt),
    }));
    
    logDebug('Notificações carregadas', { count: notifications.length });
    return notifications;
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
    logDebug('Erro ao carregar notificações', { error: String(error) });
    return [];
  }
}

// Obtém notificação ativa
export function getActiveNotification(): AppNotification | null {
  const notifications = loadNotifications();
  const active = notifications.find(n => n.isActive) || null;
  
  logDebug('Notificação ativa encontrada', { 
    active: !!active,
    id: active?.id,
    title: active?.title 
  });
  
  return active;
}

// Marca notificação como vista
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
      
      logDebug('Notificação marcada como vista', {
        userId,
        notificationId,
        totalViews: notification.shownToUsers.length
      });
    }
  }
}

// Reseta visualizações
export function resetNotificationViews(notificationId: string): void {
  const notifications = loadNotifications();
  const notificationIndex = notifications.findIndex(n => n.id === notificationId);
  
  if (notificationIndex !== -1) {
    notifications[notificationIndex].shownToUsers = [];
    notifications[notificationIndex].updatedAt = new Date();
    saveNotifications(notifications);
    
    logDebug('Visualizações resetadas', {
      notificationId,
      title: notifications[notificationIndex].title
    });
  }
}

// Ativa notificação
export function activateNotification(notificationId: string): void {
  const notifications = loadNotifications();
  
  const updatedNotifications = notifications.map(notification => ({
    ...notification,
    isActive: notification.id === notificationId,
    shownToUsers: notification.id === notificationId ? [] : notification.shownToUsers,
  }));
  
  saveNotifications(updatedNotifications);
  
  logDebug('Notificação ativada', {
    notificationId,
    activeNotifications: updatedNotifications.filter(n => n.isActive).length
  });
}

// Verifica se deve mostrar notificação
export function shouldShowNotification(): boolean {
  const userId = getUserId();
  const activeNotification = getActiveNotification();
  
  logDebug('Verificando se deve mostrar notificação', {
    userId,
    hasActive: !!activeNotification,
    activeId: activeNotification?.id,
    activeTitle: activeNotification?.title,
    isActive: activeNotification?.isActive
  });
  
  if (!activeNotification || !activeNotification.isActive) {
    logDebug('Não há notificação ativa ou não está ativa', { 
      hasActive: !!activeNotification,
      isActive: activeNotification?.isActive 
    });
    return false;
  }
  
  if (!activeNotification.showOncePerSession) {
    logDebug('Notificação configurada para mostrar sempre');
    return true;
  }
  
  const hasSeen = activeNotification.shownToUsers.includes(userId);
  
  logDebug('Verificação de visualização', {
    hasSeen,
    shownToUsersCount: activeNotification.shownToUsers.length,
    userId
  });
  
  return !hasSeen;
}