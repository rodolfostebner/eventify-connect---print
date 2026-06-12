import { supabase } from '../lib/supabase/client';
import type { Lead, LeadStatus } from '../types';

export async function createLead(data: Omit<Lead, 'id' | 'created_at' | 'product' | 'status'>): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase.from('leads').insert([data]);
  if (error) throw error;
}

export async function getLeads(exhibitorId: string): Promise<Lead[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('leads')
    .select('*, product:products(name)')
    .eq('exhibitor_id', exhibitorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Lead[];
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase.from('leads').update({ status }).eq('id', leadId);
  if (error) throw error;
}

/**
 * Assina atualizações em tempo real para os leads de um expositor.
 */
export function subscribeToLeads(
  exhibitorId: string,
  onUpdate: (leads: Lead[]) => void,
  onError?: (err: any) => void,
): () => void {
  if (!supabase) return () => {};

  // Busca inicial
  getLeads(exhibitorId)
    .then(onUpdate)
    .catch(onError);

  // Assinatura em tempo real
  const channel = supabase
    .channel(`public:leads:exhibitor_id=eq.${exhibitorId}:${Math.random().toString(36).slice(2, 9)}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leads',
        filter: `exhibitor_id=eq.${exhibitorId}`,
      },
      () => {
        getLeads(exhibitorId)
          .then(onUpdate)
          .catch(onError);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

