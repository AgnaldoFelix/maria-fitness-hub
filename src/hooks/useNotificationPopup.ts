import { useState, useEffect } from 'react';
import { 
  getActiveNotification, 
  shouldShowNotification, 
  markNotificationAsSeen,
  getUserId,
} from '@/utils/notificationStorage';
import type { AppNotification } from '@/types';
export function useNotificationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<AppNotification | null>(null);
  const [hasNotification, setHasNotification] = useState(false);

  // Verifica se deve mostrar notificação ao montar o componente
  // Verifica se deve mostrar notificação ao montar o componente
  useEffect(() => {
    const checkForNotification = () => {
      if (shouldShowNotification()) {
        const notification = getActiveNotification();
        if (notification) {
          setCurrentNotification(notification);
          setHasNotification(true);
          setIsOpen(true);
          
          // Marca como vista se for mostrar apenas uma vez
          if (notification.showOncePerSession) {
            const userId = getUserId();
            markNotificationAsSeen(userId, notification.id);
          }
        }
      }
    };

    // Pequeno delay para não atrapalhar a renderização inicial
    const timer = setTimeout(checkForNotification, 1000);
    return () => clearTimeout(timer);
  }, []);
    const checkForNotification = () => {
      if (shouldShowNotification()) {
        const notification = getActiveNotification();
        if (notification) {
          setCurrentNotification(notification);
          setHasNotification(true);
          setIsOpen(true);
          
          // Marca como vista se for mostrar apenas uma vez
          if (notification.showOncePerSession) {
            const userId = getUserId();
            markNotificationAsSeen(userId, notification.id);
          }
        }
      }
    };

    // Pequeno delay para não atrapalhar a renderização inicial
    const timer = setTimeout(checkForNotification, 1000);
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsOpen(false);
  };

  const manuallyOpenPopup = () => {
    const notification = getActiveNotification();
    if (notification?.isActive) {
      setCurrentNotification(notification);
      setIsOpen(true);
    }
  };

  return {
    isOpen,
    setIsOpen,
    currentNotification,
    hasNotification,
    closePopup,
    manuallyOpenPopup,
  return {
    isOpen,
    setIsOpen,
    currentNotification,
    hasNotification,
    closePopup,
    manuallyOpenPopup,
  };
}