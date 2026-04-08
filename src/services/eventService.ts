/**
 * eventService.ts
 *
 * All data access for the `events` collection.
 *
 * Currently backed by mockFirestore (localStorage).
 * To switch to Supabase, replace the function bodies here —
 * no changes needed in any page or component.
 */

import {
  db,
  collection, query, where, orderBy,
  onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDocs,
} from '../lib/firebase';
import type { EventData } from '../types';

// ─── Real-time subscriptions ──────────────────────────────────────────────────

/**
 * Subscribe to all events ordered by date descending.
 * Used by AdminDashboard.
 * Returns an unsubscribe function.
 */
export function subscribeToEvents(
  onUpdate: (events: EventData[]) => void,
  onError?: (err: any) => void,
): () => void {
  const q = query(collection(db, 'events'), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EventData));
      onUpdate(list);
    },
    onError,
  );
}

/**
 * Subscribe to a single event by slug.
 * Used by EventPage, TVView, ModerationPanel.
 * Returns an unsubscribe function.
 */
export function subscribeToEvent(
  slug: string,
  onUpdate: (event: EventData | null) => void,
  onError?: (err: any) => void,
): () => void {
  const cleanSlug = slug.trim().toLowerCase();
  const q = query(collection(db, 'events'), where('slug', '==', cleanSlug));
  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        onUpdate({ id: d.id, ...d.data() } as EventData);
      } else {
        onUpdate(null);
      }
    },
    onError,
  );
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Check if a slug is already taken, then create the event.
 * Returns the new event id, or throws if slug is taken.
 */
export async function createEvent(
  data: Omit<EventData, 'id'>,
): Promise<string> {
  const q = query(collection(db, 'events'), where('slug', '==', data.slug));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error('SLUG_TAKEN');
  }
  const ref = await addDoc(collection(db, 'events'), data);
  return ref.id;
}

/** Update fields on an existing event. */
export async function updateEvent(
  id: string,
  data: Partial<EventData>,
): Promise<void> {
  await updateDoc(doc(db, 'events', id), data);
}

/** Hard-delete an event by id. */
export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id));
}
