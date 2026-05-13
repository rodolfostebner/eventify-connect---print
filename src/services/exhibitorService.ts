import { supabase } from '../lib/supabase/client';
import type { Exhibitor, ExhibitorUser } from '../types';

export async function getExhibitors(eventId: string): Promise<Exhibitor[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('exhibitors')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'active')
    .order('number', { ascending: true });
  if (error) throw error;
  return (data || []) as Exhibitor[];
}

export async function getExhibitorByUserId(supabaseUserId: string): Promise<Exhibitor | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('exhibitor_users')
    .select('exhibitor_id')
    .eq('supabase_user_id', supabaseUserId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.exhibitor_id) return null;
  return getExhibitorById(data.exhibitor_id);
}

export async function getExhibitorById(id: string): Promise<Exhibitor | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('exhibitors')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Exhibitor | null;
}

export async function createExhibitor(
  data: Omit<Exhibitor, 'id' | 'created_at' | 'updated_at'>,
): Promise<Exhibitor> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { data: result, error } = await supabase
    .from('exhibitors')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result as Exhibitor;
}

export async function updateExhibitor(id: string, data: Partial<Exhibitor>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('exhibitors')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteExhibitor(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('exhibitors').delete().eq('id', id);
  if (error) throw error;
}

export async function getExhibitorUsers(exhibitorId: string): Promise<ExhibitorUser[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('exhibitor_users')
    .select('*')
    .eq('exhibitor_id', exhibitorId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as ExhibitorUser[];
}

export async function removeExhibitorUser(exhibitorUserId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('exhibitor_users').delete().eq('id', exhibitorUserId);
  if (error) throw error;
}

export async function getNextExhibitorNumber(eventId: string): Promise<number> {
  if (!supabase) return 1;
  const { data } = await supabase
    .from('exhibitors')
    .select('number')
    .eq('event_id', eventId)
    .order('number', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? data.number + 1 : 1;
}

export function subscribeToExhibitors(
  eventId: string,
  onUpdate: (exhibitors: Exhibitor[]) => void,
): () => void {
  if (!supabase) return () => {};
  getExhibitors(eventId).then(onUpdate).catch(console.error);
  const channel = supabase
    .channel(`public:exhibitors:event_id=eq.${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'exhibitors', filter: `event_id=eq.${eventId}` },
      () => getExhibitors(eventId).then(onUpdate).catch(console.error),
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
