import { supabase } from '../lib/supabase/client';
import type { Exhibitor } from '../types';
import { getExhibitors } from './exhibitorService';
import { getProductsByExhibitorIds } from './productService';

// ─── Relatório de Expositores ────────────────────────────────────────────────

export interface ExhibitorReportRow {
  exhibitor: Exhibitor;
  productCount: number;
  // Ao menos um usuário do stand já logou (pré-cadastro fica em user_email_roles
  // até o 1º login; depois o usuário existe em `users` com exhibitor_id)
  hasLoggedUser: boolean;
  // Visitantes únicos (participantes logados ou anônimos) que abriram o stand.
  // Staff (admin/event_admin/expositor/avaliador) não conta.
  visitorCount: number;
}

export async function getExhibitorsReport(eventId: string): Promise<ExhibitorReportRow[]> {
  const exhibitors = await getExhibitors(eventId);
  const ids = exhibitors.map(e => e.id);
  const products = await getProductsByExhibitorIds(ids);

  // Quantidade de produtos ativos por expositor
  const productCount = new Map<string, number>();
  for (const p of products) {
    productCount.set(p.exhibitor_id, (productCount.get(p.exhibitor_id) ?? 0) + 1);
  }

  // Stands com ao menos um usuário que já logou
  const loggedStands = new Set<string>();
  if (supabase && ids.length > 0) {
    const { data } = await supabase
      .from('users')
      .select('exhibitor_id')
      .in('exhibitor_id', ids);
    for (const row of data || []) {
      if (row.exhibitor_id) loggedStands.add(row.exhibitor_id);
    }
  }

  // Visitantes únicos por stand (ação view_stand)
  const visitorCount = new Map<string, number>();
  if (supabase && ids.length > 0) {
    const { data: visits } = await supabase
      .from('visits')
      .select('exhibitor_id, user_id, session_id')
      .eq('event_id', eventId)
      .eq('action', 'view_stand')
      .not('exhibitor_id', 'is', null);
    const rows = visits || [];

    // Usuários logados que não são participantes (staff) ficam fora da contagem
    const userIds = [...new Set(rows.map(v => v.user_id).filter(Boolean))] as string[];
    const staffIds = new Set<string>();
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, role')
        .in('id', userIds);
      for (const u of users || []) {
        if (u.role !== 'participant') staffIds.add(u.id);
      }
    }

    const visitorsByStand = new Map<string, Set<string>>();
    for (const v of rows) {
      if (!v.exhibitor_id) continue;
      if (v.user_id && staffIds.has(v.user_id)) continue;
      const key = v.user_id ?? v.session_id;
      if (!key) continue;
      const set = visitorsByStand.get(v.exhibitor_id) ?? new Set<string>();
      set.add(key);
      visitorsByStand.set(v.exhibitor_id, set);
    }
    for (const [id, set] of visitorsByStand) visitorCount.set(id, set.size);
  }

  return exhibitors.map(ex => ({
    exhibitor: ex,
    productCount: productCount.get(ex.id) ?? 0,
    hasLoggedUser: loggedStands.has(ex.id),
    visitorCount: visitorCount.get(ex.id) ?? 0,
  }));
}
