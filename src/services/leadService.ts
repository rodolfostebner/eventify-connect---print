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
