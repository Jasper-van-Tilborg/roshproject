'use client';

import { useState, useCallback } from 'react';
import Notification from '../components/Notification';

interface NotificationState {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

let notificationId = 0;

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const showNotification = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    const id = notificationId++;
    setNotifications(prev => [...prev, { message, type, id }]);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const NotificationContainer = () => (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );

  return { showNotification, NotificationContainer };
}

