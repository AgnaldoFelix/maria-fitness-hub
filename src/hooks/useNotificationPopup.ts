import { useState, useEffect } from 'react';
import { 
  getActiveNotification, 
  shouldShowNotification, 
  markNotificationAsSeen,
  getUserId,
  type AppNotification 
} from '@/utils/notificationStorage';

export function useNotificationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<AppNotification | null>(null);
  const [hasNotification, setHasNotification] = useState(false);

  useEffect(() => {
    const checkForNotification = () => {
      if (shouldShowNotification()) {
        const notification = getActiveNotification();
        if (notification) {
          setCurrentNotification(notification);
          setHasNotification(true);
          setIsOpen(true);
          if (notification.showOncePerSession) {
            const userId = getUserId();
            markNotificationAsSeen(userId, notification.id);
          }
        }
      }
    };

    // Verifica a cada 2 segundos se há nova notificação ativa
    const interval = setInterval(checkForNotification, 2000);
    
    // Verificação inicial
    checkForNotification();

    return () => clearInterval(interval);
  }, []);

  const closePopup = () => setIsOpen(false);
  
  const manuallyOpenPopup = () => {
    const notification = getActiveNotification();
    if (notification?.isActive) {
      setCurrentNotification(notification);
      setIsOpen(true);
      
      // Marca como vista se for mostrar apenas uma vez
      if (notification.showOncePerSession) {
        const userId = getUserId();
        markNotificationAsSeen(userId, notification.id);
      }
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