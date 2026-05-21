import { supabase } from '../lib/supabase/client';
import type { RaffleTicket } from '../types';

// ─── Criação de Ticket ───────────────────────────────────────────────────────

/**
 * Gera um ticket de sorteio para o participante.
 * Silenciosamente ignora se o ticket já existe (UNIQUE constraint).
 */
export async function ensureRaffleTicket(
  eventId: string,
  userId: string,
): Promise<RaffleTicket | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('raffle_tickets')
    .upsert(
      { event_id: eventId, user_id: userId },
      { onConflict: 'event_id,user_id' },
    )
    .select()
    .single();
  if (error) {
    console.error('[RaffleService] Erro ao criar ticket:', error);
    return null;
  }
  return data as RaffleTicket;
}

// ─── Consultas ───────────────────────────────────────────────────────────────

export async function getEventTickets(eventId: string): Promise<RaffleTicket[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('raffle_tickets')
    .select('*, user:users(display_name, email)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as RaffleTicket[];
}

export async function getTicketCount(eventId: string): Promise<number> {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from('raffle_tickets')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);
  if (error) throw error;
  return count ?? 0;
}

export async function hasUserTicket(eventId: string, userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('raffle_tickets')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

// ─── Sorteio Automático ──────────────────────────────────────────────────────

/**
 * Sorteia um ticket aleatório do evento.
 * Retorna null se não houver tickets cadastrados.
 */
export async function drawRandomTicket(eventId: string): Promise<RaffleTicket | null> {
  if (!supabase) return null;

  // Busca total de tickets para gerar offset aleatório
  const total = await getTicketCount(eventId);
  if (total === 0) return null;

  const randomOffset = Math.floor(Math.random() * total);
  const { data, error } = await supabase
    .from('raffle_tickets')
    .select('*, user:users(display_name, email)')
    .eq('event_id', eventId)
    .range(randomOffset, randomOffset)
    .single();

  if (error) {
    console.error('[RaffleService] Erro no sorteio:', error);
    return null;
  }
  return data as RaffleTicket;
}

// ─── Realtime ────────────────────────────────────────────────────────────────

export function subscribeToRaffleTickets(
  eventId: string,
  onUpdate: () => void,
): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`public:raffle_tickets:event_id=eq.${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'raffle_tickets', filter: `event_id=eq.${eventId}` },
      onUpdate,
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
