import { supabase } from '../lib/supabase/client';
import type { RaffleTicket, RafflePrize } from '../types';

// ─── Tickets ─────────────────────────────────────────────────────────────────

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

// ─── Prêmios ──────────────────────────────────────────────────────────────────

export async function getPrizes(eventId: string): Promise<RafflePrize[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('raffle_prizes')
    .select('*, winner:raffle_tickets(user:users(display_name, email))')
    .eq('event_id', eventId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  // Normaliza join aninhado: winner.user → winner
  return ((data || []) as any[]).map((p) => ({
    ...p,
    winner: p.winner?.user ?? null,
  })) as RafflePrize[];
}

export async function getPrize(prizeId: string): Promise<RafflePrize | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('raffle_prizes')
    .select('*, winner:raffle_tickets(user:users(display_name, email))')
    .eq('id', prizeId)
    .single();
  if (error) return null;
  return { ...data, winner: (data as any).winner?.user ?? null } as RafflePrize;
}

export async function createPrize(
  prize: Pick<RafflePrize, 'event_id' | 'name'> & Partial<Pick<RafflePrize, 'description' | 'image_url' | 'order_index'>>,
): Promise<RafflePrize | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('raffle_prizes')
    .insert(prize)
    .select()
    .single();
  if (error) throw error;
  return data as RafflePrize;
}

export async function updatePrize(
  prizeId: string,
  updates: Partial<Pick<RafflePrize, 'name' | 'description' | 'image_url' | 'order_index' | 'active'>>,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('raffle_prizes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', prizeId);
  if (error) throw error;
}

export async function deletePrize(prizeId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('raffle_prizes')
    .delete()
    .eq('id', prizeId);
  if (error) throw error;
}

export function subscribeToPrizes(
  eventId: string,
  onUpdate: () => void,
): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`public:raffle_prizes:event_id=eq.${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'raffle_prizes', filter: `event_id=eq.${eventId}` },
      onUpdate,
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ─── Sorteio ──────────────────────────────────────────────────────────────────

/**
 * Sorteia um ticket aleatório, grava o ganhador no prêmio e
 * atualiza o estado do telão para 'showing_winner'.
 * Idempotente: retorna o ganhador já gravado se o prêmio já foi sorteado.
 */
export async function drawPrize(
  prizeId: string,
  eventId: string,
): Promise<RaffleTicket | null> {
  if (!supabase) return null;

  // Garante idempotência
  const existing = await getPrize(prizeId);
  if (existing?.winner_ticket_id) {
    const { data } = await supabase
      .from('raffle_tickets')
      .select('*, user:users(display_name, email)')
      .eq('id', existing.winner_ticket_id)
      .single();
    return data as RaffleTicket;
  }

  const total = await getTicketCount(eventId);
  if (total === 0) return null;

  const randomOffset = Math.floor(Math.random() * total);
  const { data: ticket, error: ticketError } = await supabase
    .from('raffle_tickets')
    .select('*, user:users(display_name, email)')
    .eq('event_id', eventId)
    .range(randomOffset, randomOffset)
    .single();

  if (ticketError || !ticket) {
    console.error('[RaffleService] Erro no sorteio:', ticketError);
    return null;
  }

  // Persiste ganhador no prêmio
  const { error: updateError } = await supabase
    .from('raffle_prizes')
    .update({
      winner_ticket_id: ticket.id,
      drawn_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', prizeId);

  if (updateError) {
    console.error('[RaffleService] Erro ao gravar ganhador:', updateError);
    return null;
  }

  // Atualiza estado do telão
  await setTvRaffleState(eventId, 'showing_winner', prizeId);

  return ticket as RaffleTicket;
}

// ─── Estado do Telão ─────────────────────────────────────────────────────────

export async function setTvRaffleState(
  eventId: string,
  state: 'idle' | 'showing_prize' | 'showing_winner',
  prizeId?: string | null,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('events')
    .update({
      tv_raffle_state: state,
      tv_raffle_prize_id: prizeId ?? null,
    })
    .eq('id', eventId);
  if (error) throw error;
}
