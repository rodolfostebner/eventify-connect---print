import { supabase } from '../lib/supabase/client';
import type { Sponsor } from '../types';

const TABLE = 'sponsors';

export function subscribeToSponsors(eventId: string, cb: (sponsors: Sponsor[]) => void) {
  if (!supabase) return () => {};
  const fetch = () =>
    supabase!
      .from(TABLE)
      .select('*')
      .eq('event_id', eventId)
      .eq('active', true)
      .order('order_index')
      .then(({ data }) => cb((data || []) as Sponsor[]));
  fetch();
  const channel = supabase
    .channel(`public:sponsors:event_id=eq.${eventId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE, filter: `event_id=eq.${eventId}` }, fetch)
    .subscribe();
  return () => { supabase!.removeChannel(channel); };
}

export async function getSponsors(eventId: string): Promise<Sponsor[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('event_id', eventId)
    .eq('active', true)
    .order('order_index');
  if (error) throw error;
  return (data || []) as Sponsor[];
}

export async function createSponsor(data: Omit<Sponsor, 'id' | 'created_at' | 'updated_at'>): Promise<Sponsor> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { data: created, error } = await supabase.from(TABLE).insert([data]).select().single();
  if (error) throw error;
  return created as Sponsor;
}

export async function updateSponsor(id: string, data: Partial<Sponsor>): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase.from(TABLE).update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function deleteSponsor(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase.from(TABLE).update({ active: false }).eq('id', id);
  if (error) throw error;
}
