import { useEffect, useState } from 'react';
import { subscribeToNotifications, markNotificationRead } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export function NotificationsListener() {
  const { user } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(() => {
    return localStorage.getItem('push_notifications_enabled') === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setPushEnabled(localStorage.getItem('push_notifications_enabled') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('push_notifications_toggled', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('push_notifications_toggled', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!user || !pushEnabled) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return subscribeToNotifications(user.id, (notifications) => {
      notifications.forEach((notif) => {
        toast(notif.title, {
          description: notif.body,
          action: notif.link
            ? { label: 'Ver', onClick: () => (window.location.href = notif.link!) }
            : undefined,
        });

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notif.title, { body: notif.body });
        }

        markNotificationRead(notif.id).catch(console.error);
      });
    }, (error) => {
      console.error('Error listening to notifications:', error);
    });
  }, [user, pushEnabled]);

  return null;
}
