import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, db, collection, query, where, onSnapshot, doc } from '../lib/firebase';
import type { User } from '../lib/firebase';
import { markNotificationRead } from '../services/notificationService';
import { toast } from 'sonner';

export function NotificationsListener() {
  const [user, setUser] = useState<User | null>(null);
  const [pushEnabled, setPushEnabled] = useState(() => {
    return localStorage.getItem('push_notifications_enabled') === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setPushEnabled(localStorage.getItem('push_notifications_enabled') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    // Also listen to a custom event for same-window updates
    window.addEventListener('push_notifications_toggled', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('push_notifications_toggled', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Request permission for browser notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === 'added') {
          const notification = change.doc.data();

          if (pushEnabled) {
            // Show in-app toast
            toast(notification.title, {
              description: notification.body,
              action: notification.link
                ? { label: 'Ver', onClick: () => (window.location.href = notification.link) }
                : undefined,
            });

            // Show browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(notification.title, { body: notification.body });
            }
          }

          // Mark as read via service so it doesn't trigger again
          markNotificationRead(change.doc.id).catch(console.error);
        }
      });
    }, (error: any) => {
      console.error('Error listening to notifications:', error);
    });

    return () => unsubscribe();
  }, [user, pushEnabled]);

  return null;
}
