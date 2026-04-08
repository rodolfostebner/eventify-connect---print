import { supabase } from '../lib/supabase';
import type { PrintOrder } from '../types';

/**
 * Subscribe to all print orders for an event, sorted by createdAt desc.
 * Used by ModerationPanel.
 */
export function subscribeToPrintOrders(
  eventId: string,
  onUpdate: (orders: PrintOrder[]) => void,
  onError?: (err: any) => void,
): () => void {
  if (!supabase) return () => {};

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('print_orders')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) onError?.(error);
    else onUpdate(data.map(mapRowToPrintOrder));
  };

  // Initial fetch
  fetchOrders();

  // Real-time subscription
  const channel = supabase
    .channel(`public:print_orders:event_id=eq.${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'print_orders',
        filter: `event_id=eq.${eventId}`
      },
      () => {
        fetchOrders();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Submit a new print order.
 */
export async function createPrintOrder(data: {
  eventId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  photoIds: string[];
  option: string;
}): Promise<string> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: result, error } = await supabase
    .from('print_orders')
    .insert([{
      event_id: data.eventId,
      user_id: data.userId,
      user_name: data.userName,
      user_email: data.userEmail,
      photo_ids: data.photoIds,
      option: data.option,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return result.id;
}

/** 
 * Mark a print order as completed. 
 */
export async function completePrintOrder(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('print_orders')
    .update({ status: 'completed' })
    .eq('id', id);
  if (error) throw error;
}

/** 
 * Delete a print order. 
 */
export async function deletePrintOrder(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('print_orders')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/**
 * Helper to map Supabase row (snake_case) to PrintOrder interface (camelCase).
 */
function mapRowToPrintOrder(row: any): PrintOrder {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    photoIds: row.photo_ids,
    option: row.option,
    status: row.status,
    createdAt: row.created_at
  };
}
