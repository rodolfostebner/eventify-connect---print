import { useEffect, useState } from 'react';
import { subscribeToAuth, User } from '../services/authService';
import { subscribeToNotifications, markNotificationRead } from '../services/notificationService';
import { toast } from 'sonner';

export function NotificationsListener() {
  const [user, setUser] = useState<User | null>(null);
  const [pushEnabled, setPushEnabled] = useState(() => {
    return localStorage.getItem('push_notifications_enabled') === 'true';
  });

  // Listen to preference changes
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

  // Listen to Auth
  useEffect(() => {
    return subscribeToAuth((currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // Listen to Notifications
  useEffect(() => {
    if (!user || !pushEnabled) return;

    // Request permission for browser notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Use the central service instead of direct Firestore
    return subscribeToNotifications(user.uid, (notifications) => {
      // Loop through unread notifications
      notifications.forEach((notif) => {
        // Show in-app toast
        toast(notif.title, {
          description: notif.body,
          action: notif.link
            ? { label: 'Ver', onClick: () => (window.location.href = notif.link!) }
            : undefined,
        });

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notif.title, { body: notif.body });
        }

        // Mark as read so it doesn't pop up again
        markNotificationRead(notif.id).catch(console.error);
      });
    }, (error) => {
      console.error('Error listening to notifications:', error);
    });
  }, [user, pushEnabled]);

  return null;
}
