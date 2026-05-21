import { supabase } from '../lib/supabase/client';
import type { AppUser, AuditChange, AuditLog } from '../types';

// ─── Registro de Alteração ───────────────────────────────────────────────────

/**
 * Calcula o diff entre dois objetos, retornando apenas os campos alterados
 * no formato { campo: { before, after } }. Comparação por JSON para cobrir
 * arrays/objetos aninhados.
 */
export function diffObjects(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, AuditChange> {
  const changes: Record<string, AuditChange> = {};
  for (const key of Object.keys(after)) {
    const a = before[key];
    const b = after[key];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      changes[key] = { before: a ?? null, after: b ?? null };
    }
  }
  return changes;
}

/**
 * Grava uma entrada de auditoria. Silencioso — nunca lança erro para não
 * bloquear o salvamento da alteração que está sendo auditada.
 */
export async function logChange(params: {
  eventId: string;
  user: AppUser | null;
  action: string;
  changes: Record<string, AuditChange>;
}): Promise<void> {
  if (!supabase) return;
  // Nada alterado → nada a registrar
  if (Object.keys(params.changes).length === 0) return;
  try {
    await supabase.from('audit_logs').insert([{
      event_id: params.eventId,
      user_id: params.user?.id ?? null,
      user_name: params.user?.display_name ?? null,
      user_email: params.user?.email ?? null,
      action: params.action,
      changes: params.changes,
    }]);
  } catch (err) {
    console.warn('[AuditService] Erro ao registrar auditoria:', err);
  }
}

// ─── Consulta ─────────────────────────────────────────────────────────────────

export async function getEventAuditLogs(eventId: string, limit = 100): Promise<AuditLog[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as AuditLog[];
}
