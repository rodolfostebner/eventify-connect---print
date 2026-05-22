import { supabase } from '../lib/supabase/client';
import { getSessionId } from '../utils/session';
import type { Visit, VisitAction } from '../types';

// ─── Registro de Visita/Clique ───────────────────────────────────────────────

/**
 * Registra uma ação de visita/clique silenciosamente.
 * Nunca lança erro para não impactar a experiência do usuário.
 * Se sessionId não for informado, usa o ID de sessão anônima do browser.
 */
export async function trackVisit(params: {
  eventId: string;
  exhibitorId?: string;
  productId?: string;
  userId?: string;
  sessionId?: string;
  action: VisitAction;
  eventStatus?: 'pre' | 'live' | 'post';
}): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('visits').insert([{
      event_id: params.eventId,
      exhibitor_id: params.exhibitorId ?? null,
      product_id: params.productId ?? null,
      user_id: params.userId ?? null,
      session_id: params.sessionId ?? getSessionId(),
      action: params.action,
      event_status: params.eventStatus ?? null,
    }]);
  } catch (err) {
    // Silencioso — analytics nunca deve bloquear o fluxo do usuário
    console.warn('[VisitService] Erro ao registrar visita:', err);
  }
}

// ─── Consultas Agregadas (Relatórios do Expositor) ───────────────────────────

export interface VisitSummary {
  action: VisitAction;
  count: number;
}

/**
 * Retorna contagem de visitas agrupadas por ação para um expositor.
 */
export async function getExhibitorVisitSummary(exhibitorId: string): Promise<VisitSummary[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .rpc('get_exhibitor_visit_summary', { p_exhibitor_id: exhibitorId });

  // Fallback caso a RPC não exista: query manual agrupada
  if (error) {
    console.warn('[VisitService] RPC indisponível, usando fallback:', error.message);
    return getExhibitorVisitSummaryFallback(exhibitorId);
  }
  return (data || []) as VisitSummary[];
}

async function getExhibitorVisitSummaryFallback(exhibitorId: string): Promise<VisitSummary[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('visits')
    .select('action')
    .eq('exhibitor_id', exhibitorId);
  if (error) return [];

  // Agrupamento manual no cliente
  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.action] = (counts[row.action] || 0) + 1;
  }
  return Object.entries(counts).map(([action, count]) => ({
    action: action as VisitAction,
    count,
  }));
}

/**
 * Retorna total de visitas únicas por expositor em um evento (para ranking de visitas).
 */
export async function getEventVisitCounts(eventId: string): Promise<Record<string, number>> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from('visits')
    .select('exhibitor_id')
    .eq('event_id', eventId)
    .not('exhibitor_id', 'is', null);
  if (error) return {};

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    if (row.exhibitor_id) {
      counts[row.exhibitor_id] = (counts[row.exhibitor_id] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Retorna os produtos mais vistos de um expositor.
 */
export async function getTopProducts(
  exhibitorId: string,
  limit: number = 10,
): Promise<{ product_id: string; count: number }[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('visits')
    .select('product_id')
    .eq('exhibitor_id', exhibitorId)
    .eq('action', 'view_product')
    .not('product_id', 'is', null);
  if (error) return [];

  // Agrupamento manual no cliente
  const counts: Record<string, number> = {};
  for (const row of data || []) {
    if (row.product_id) {
      counts[row.product_id] = (counts[row.product_id] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([product_id, count]) => ({ product_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
