/**
 * contactLeadService.ts
 *
 * Serviço para gerenciar leads do formulário "Fale com um Especialista" da landing page.
 * Tabela: contact_leads (ver SQL de migração em docs/sql/contact_leads.sql)
 */

import { supabase } from '../lib/supabase/client';

export interface ContactLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  event_name: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
}

/**
 * Insere um novo lead de contato na tabela contact_leads.
 * Lança erro se falhar — o chamador deve tratar com toast.
 */
export async function createContactLead(lead: Omit<ContactLead, 'id' | 'status' | 'created_at'>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('contact_leads')
    .insert([{ ...lead, status: 'new' }]);
  if (error) throw error;
}

/**
 * Obtém todos os leads de contato.
 * Apenas acessível por administradores autenticados devido às políticas de RLS.
 */
export async function getContactLeads(): Promise<ContactLead[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('contact_leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ContactLead[];
}

/**
 * Atualiza o status de um lead de contato.
 */
export async function updateContactLeadStatus(id: string, status: 'new' | 'contacted' | 'closed'): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase
    .from('contact_leads')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Exclui um lead de contato do banco de dados.
 */
export async function deleteContactLead(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase
    .from('contact_leads')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
