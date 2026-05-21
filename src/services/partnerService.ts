import { supabase } from '../lib/supabase/client';
import type { Partner } from '../types';

const TABLE = 'partners';

export function subscribeToPartners(eventId: string, cb: (partners: Partner[]) => void) {
  if (!supabase) return () => {};
  const fetch = () =>
    supabase!
      .from(TABLE)
      .select('*')
      .eq('event_id', eventId)
      .eq('active', true)
      .order('order_index')
      .then(({ data }) => cb((data || []) as Partner[]));
  fetch();
  const channel = supabase
    .channel(`public:partners:event_id=eq.${eventId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE, filter: `event_id=eq.${eventId}` }, fetch)
    .subscribe();
  return () => { supabase!.removeChannel(channel); };
}

export async function getPartners(eventId: string): Promise<Partner[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('event_id', eventId)
    .eq('active', true)
    .order('order_index');
  if (error) throw error;
  return (data || []) as Partner[];
}

export async function createPartner(data: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<Partner> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { data: created, error } = await supabase.from(TABLE).insert([data]).select().single();
  if (error) throw error;
  return created as Partner;
}

export async function updatePartner(id: string, data: Partial<Partner>): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase.from(TABLE).update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function deletePartner(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase.from(TABLE).update({ active: false }).eq('id', id);
  if (error) throw error;
}
