/**
 * printService.ts
 *
 * All data access for the `print_orders` collection.
 *
 * Currently backed by mockFirestore (localStorage).
 * To switch to Supabase, replace the function bodies here —
 * no changes needed in any page or component.
 */

import {
  db,
  collection, query, where,
  onSnapshot, addDoc, updateDoc, doc, deleteDoc, Timestamp,
} from '../lib/firebase';
import type { PrintOrder } from '../types';

// ─── Real-time subscriptions ──────────────────────────────────────────────────

/**
 * Subscribe to all print orders for an event, sorted by createdAt desc.
 * Used by ModerationPanel.
 */
export function subscribeToPrintOrders(
  eventId: string,
  onUpdate: (orders: PrintOrder[]) => void,
  onError?: (err: any) => void,
): () => void {
  const q = query(
    collection(db, 'print_orders'),
    where('eventId', '==', eventId),
  );
  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PrintOrder));
      // Sort client-side descending — avoids needing a composite Firestore index
      orders.sort((a, b) => {
        const tA = (a.createdAt as any)?.seconds ?? 0;
        const tB = (b.createdAt as any)?.seconds ?? 0;
        return tB - tA;
      });
      onUpdate(orders);
    },
    onError,
  );
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Submit a new print order.
 * Returns the new order id.
 */
export async function createPrintOrder(data: {
  eventId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  photoIds: string[];
  option: string;
}): Promise<string> {
  const result = await addDoc(collection(db, 'print_orders'), {
    ...data,
    status: 'pending',
    createdAt: Timestamp.now(),
  });
  return result.id;
}

/** Mark a print order as completed. */
export async function completePrintOrder(id: string): Promise<void> {
  await updateDoc(doc(db, 'print_orders', id), { status: 'completed' });
}

/** Delete a print order. */
export async function deletePrintOrder(id: string): Promise<void> {
  await deleteDoc(doc(db, 'print_orders', id));
}
