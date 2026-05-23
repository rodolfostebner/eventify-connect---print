import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export function NotificationsListener() {
  const { user } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(() => {
    return localStorage.getItem('push_notifications_enabled') === 'true';
  });

  // Absolutely suppress all toast/push listeners on the TV Wall page
  const isTvView = window.location.pathname.includes('/tv/');
  if (isTvView) return null;

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
    if (!user || !pushEnabled || !supabase) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Subscribe ONLY to new real-time INSERT notifications
    const channel = supabase
      .channel(`public:notifications:user_id=eq.${user.id}:insert`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notif = payload.new as any;
          if (!notif) return;

          // DETERMINISTIC RULE: If the link contains #silent, a popup is also being shown.
          // In that case, skip ALL visual alerts — the notification goes straight to history only.
          const isSilent = notif.link && notif.link.includes('#silent');

          if (isSilent) {
            // Do nothing visually. The notification is already saved in the DB
            // and will appear in the history drawer with the unread badge.
            return;
          }

          // Push-only notification: show Toast and native push as normal
          toast(notif.title, {
            description: notif.body,
            action: notif.link
              ? { label: 'Ver', onClick: () => (window.location.href = notif.link!) }
              : undefined,
          });

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notif.title, { body: notif.body });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, pushEnabled]);

  return null;
}
