/**
 * notificationService.ts
 *
 * All data access for the `notifications` collection.
 *
 * Currently backed by mockFirestore (localStorage).
 * To switch to Supabase, replace the function bodies here —
 * no changes needed in any page or component.
 */

import {
  db,
  collection, query, where,
  onSnapshot, addDoc, updateDoc, doc, Timestamp,
} from '../lib/firebase';
import type { NotificationData } from '../types';

// ─── Real-time subscriptions ──────────────────────────────────────────────────

/**
 * Subscribe to unread notifications for a user.
 * Used by NotificationsListener.
 */
export function subscribeToNotifications(
  userId: string,
  onUpdate: (notifications: NotificationData[]) => void,
  onError?: (err: any) => void,
): () => void {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
  );
  return onSnapshot(
    q,
    (snap) => onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationData))),
    onError,
  );
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Mark a notification as read so it won't trigger again. */
export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', id), { read: true });
}

/**
 * Create a notification for a user.
 * Called by ModerationPanel when approving photos/comments.
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  body: string;
  link?: string;
}): Promise<void> {
  await addDoc(collection(db, 'notifications'), {
    ...data,
    read: false,
    timestamp: Timestamp.now(),
  });
}
