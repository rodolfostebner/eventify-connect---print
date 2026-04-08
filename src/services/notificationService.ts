import { supabase } from '../lib/supabase';
import type { NotificationData } from '../types';

/**
 * Subscribe to unread notifications for a user.
 */
export function subscribeToNotifications(
  userId: string,
  onUpdate: (notifications: NotificationData[]) => void,
  onError?: (err: any) => void,
): () => void {
  if (!supabase) return () => {};

  // Initial fetch
  supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .then(({ data, error }) => {
      if (error) onError?.(error);
      else onUpdate(data as NotificationData[]);
    });

  // Real-time subscription
  const channel = supabase
    .channel(`public:notifications:user_id=eq.${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      () => {
        // Re-fetch on any change to keep unread list synced
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .eq('read', false)
          .then(({ data, error }) => {
            if (error) onError?.(error);
            else onUpdate(data as NotificationData[]);
          });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Create a new notification for a user.
 */
export async function createNotification(
  data: Omit<NotificationData, 'id' | 'timestamp' | 'read'> & { read?: boolean }
): Promise<string> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: result, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: data.userId,
      title: data.title,
      body: data.body,
      read: data.read ?? false,
      link: data.link
    }])
    .select()
    .single();

  if (error) throw error;
  return result.id;
}

/** 
 * Mark a notification as read. 
 */
export async function markNotificationRead(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
  if (error) throw error;
}
