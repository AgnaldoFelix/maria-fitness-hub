import { useState, useEffect } from 'react';
import { 
  getActiveNotification, 
  shouldShowNotification, 
  markNotificationAsSeen,
  getUserId,
  type AppNotification,
  logDebug 
} from '@/utils/notificationStorage';

export function useNotificationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<AppNotification | null>(null);
  const [hasNotification, setHasNotification] = useState(false);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  useEffect(() => {
    logDebug('Hook de notificação montado');
    
    const checkAndShowNotification = () => {
      try {
        logDebug('Iniciando verificação de notificação');
        
        if (shouldShowNotification()) {
          const notification = getActiveNotification();
          
          if (notification) {
            // Evita reabrir a mesma notificação
            if (notification.id === lastNotificationId) {
              logDebug('Notificação já foi mostrada nesta sessão', { id: notification.id });
              return;
            }
            
            logDebug('Mostrando notificação', {
              id: notification.id,
              title: notification.title,
              showOnce: notification.showOncePerSession
            });
            
            setCurrentNotification(notification);
            setHasNotification(true);
            setLastNotificationId(notification.id);
            setIsOpen(true);
            
            // Marca como vista imediatamente
            if (notification.showOncePerSession) {
              const userId = getUserId();
              markNotificationAsSeen(userId, notification.id);
              logDebug('Notificação marcada como vista', { userId, id: notification.id });
            }
          }
        } else {
          logDebug('Não deve mostrar notificação no momento');
        }
      } catch (error) {
        console.error('Erro ao verificar notificação:', error);
        logDebug('Erro na verificação', { error: String(error) });
      }
    };

    // Verificação inicial com delay
    const initialTimer = setTimeout(checkAndShowNotification, 1500);
    
    // Event listener para detectar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_notifications') {
        logDebug('Detectada mudança nas notificações, verificando...');
        setTimeout(checkAndShowNotification, 500);
      }
    };

    // Polling para verificar mudanças (para mudanças na mesma aba)
    const pollingInterval = setInterval(() => {
      const activeNotification = getActiveNotification();
      if (activeNotification?.id !== lastNotificationId && activeNotification?.isActive) {
        logDebug('Nova notificação detectada via polling', { 
          newId: activeNotification.id,
          oldId: lastNotificationId 
        });
        checkAndShowNotification();
      }
    }, 3000);

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(pollingInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [lastNotificationId]);

  const closePopup = () => {
    logDebug('Popup fechado pelo usuário');
    setIsOpen(false);
  };

  const manuallyOpenPopup = () => {
    logDebug('Abertura manual do popup solicitada');
    const notification = getActiveNotification();
    
    if (notification?.isActive) {
      logDebug('Abrindo popup manualmente', { id: notification.id });
      setCurrentNotification(notification);
      setIsOpen(true);
      
      // Marca como vista se for mostrar apenas uma vez
      if (notification.showOncePerSession) {
        const userId = getUserId();
        markNotificationAsSeen(userId, notification.id);
      }
    } else {
      logDebug('Nenhuma notificação ativa para mostrar manualmente');
    }
  };

  return { 
    isOpen, 
    setIsOpen, 
    currentNotification, 
    hasNotification, 
    closePopup, 
    manuallyOpenPopup 
  };
}