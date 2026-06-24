import { supabase } from '../lib/supabase/client';
import type {
  Evaluation,
  EvaluationCategory,
  JurorEvaluation,
  ExhibitorRanking,
} from '../types';

// ─── Categorias de Avaliação ─────────────────────────────────────────────────

export async function getEvaluationCategories(eventId: string): Promise<EvaluationCategory[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('evaluation_categories')
    .select('*')
    .eq('event_id', eventId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return (data || []) as EvaluationCategory[];
}

export async function createEvaluationCategory(
  data: Omit<EvaluationCategory, 'id' | 'created_at'>,
): Promise<EvaluationCategory> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { data: created, error } = await supabase
    .from('evaluation_categories')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return created as EvaluationCategory;
}

export async function updateEvaluationCategory(
  id: string,
  data: Partial<Pick<EvaluationCategory, 'name' | 'weight' | 'order_index'>>,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('evaluation_categories')
    .update(data)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteEvaluationCategory(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('evaluation_categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── Avaliações do Público (1–5 estrelas) ────────────────────────────────────

export async function submitEvaluation(
  data: Omit<Evaluation, 'id' | 'created_at'>,
): Promise<Evaluation> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { data: created, error } = await supabase
    .from('evaluations')
    .insert([data])
    .select()
    .single();
  if (error) {
    // Erro 23505 = violação de UNIQUE (usuário já avaliou este expositor)
    if (error.code === '23505') {
      throw new Error('Você já avaliou este expositor.');
    }
    throw error;
  }
  return created as Evaluation;
}

export async function getUserEvaluation(
  exhibitorId: string,
  userId: string,
): Promise<Evaluation | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('exhibitor_id', exhibitorId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Evaluation | null;
}

export async function getExhibitorEvaluations(exhibitorId: string): Promise<Evaluation[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('evaluations')
    .select('*, user:users(display_name, photo_url)')
    .eq('exhibitor_id', exhibitorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Evaluation[];
}

export async function updateEvaluation(
  id: string,
  stars: number,
  comment: string | null,
  commentStatus?: 'pending' | 'approved' | 'rejected',
): Promise<void> {
  if (!supabase) return;
  const payload: any = { stars, comment };
  if (commentStatus) {
    payload.comment_status = commentStatus;
  }
  const { error } = await supabase
    .from('evaluations')
    .update(payload)
    .eq('id', id);
  if (error) throw error;
}

export async function getPendingEvaluations(eventId: string): Promise<Evaluation[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('evaluations')
    .select('*, user:users(display_name, photo_url), exhibitor:exhibitors(name, logo_url)')
    .eq('event_id', eventId)
    .eq('comment_status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Evaluation[];
}

export async function moderateEvaluationComment(
  id: string,
  status: 'approved' | 'rejected',
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('evaluations')
    .update({ comment_status: status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteEvaluation(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('evaluations')
    .delete()
    .eq('id', id);
  if (error) throw error;
}


// ─── Avaliações dos Jurados (por categoria) ──────────────────────────────────

export async function submitJurorEvaluations(
  evaluations: Omit<JurorEvaluation, 'id' | 'created_at'>[],
): Promise<void> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { error } = await supabase
    .from('juror_evaluations')
    .upsert(evaluations, { onConflict: 'exhibitor_id,user_id,category_id' });
  if (error) throw error;
}

export async function getJurorEvaluationsForExhibitor(
  exhibitorId: string,
  userId: string,
): Promise<JurorEvaluation[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('juror_evaluations')
    .select('*')
    .eq('exhibitor_id', exhibitorId)
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []) as JurorEvaluation[];
}

export async function getJurorEvaluationsForEvent(
  eventId: string,
  userId: string,
): Promise<JurorEvaluation[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('juror_evaluations')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []) as JurorEvaluation[];
}

// ─── Controle de Status das Avaliações ───────────────────────────────────────

export async function setEvaluationStatus(
  eventId: string,
  status: 'open' | 'closed' | 'published',
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('events')
    .update({ evaluation_status: status })
    .eq('id', eventId);
  if (error) throw error;
}

// ─── Dados Públicos do Expositor (para card do avaliador) ────────────────────

export interface ExhibitorPublicStats {
  evaluation_count: number;
  avg_stars: number | null;
  visitors_pre: number;
  visitors_live: number;
}

export async function getExhibitorPublicStats(exhibitorId: string): Promise<ExhibitorPublicStats> {
  if (!supabase) return { evaluation_count: 0, avg_stars: null, visitors_pre: 0, visitors_live: 0 };
  const [{ data: evalData }, { data: visitData }] = await Promise.all([
    supabase.from('evaluations').select('stars').eq('exhibitor_id', exhibitorId),
    supabase
      .from('visits')
      .select('session_id,event_status')
      .eq('exhibitor_id', exhibitorId)
      .eq('action', 'view_stand'),
  ]);
  const evals = (evalData || []) as { stars: number }[];
  const visits = (visitData || []) as { session_id: string | null; event_status: string | null }[];
  const evaluation_count = evals.length;
  const avg_stars = evaluation_count > 0
    ? evals.reduce((s, e) => s + e.stars, 0) / evaluation_count
    : null;
  const preSet = new Set(visits.filter(v => v.event_status === 'pre' && v.session_id).map(v => v.session_id));
  const liveSet = new Set(visits.filter(v => v.event_status === 'live' && v.session_id).map(v => v.session_id));
  return { evaluation_count, avg_stars, visitors_pre: preSet.size, visitors_live: liveSet.size };
}

// ─── Relatório: Avaliações & Comentários a Expositores ───────────────────────

export interface EvaluationReportRow {
  id: string;
  exhibitor_id: string;
  exhibitor_name: string;
  exhibitor_number: number | null;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  stars: number;
  comment: string | null;
  comment_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface JurorEvaluationReportRow {
  id: string;
  exhibitor_id: string;
  exhibitor_name: string;
  exhibitor_number: number | null;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  category_id: string;
  category_name: string | null;
  score: number;
  created_at: string;
}

/**
 * Todas as avaliações do público (estrelas + comentário) de um evento, já com
 * quem avaliou (nome, e-mail, role atual) e o expositor avaliado. A role é a
 * atual do usuário — não há histórico de role por avaliação.
 */
export async function getEvaluationsReport(eventId: string): Promise<EvaluationReportRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('evaluations')
    .select('id, exhibitor_id, user_id, stars, comment, comment_status, created_at, user:users(display_name, email, role), exhibitor:exhibitors(name, number)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    exhibitor_id: r.exhibitor_id,
    exhibitor_name: r.exhibitor?.name ?? '—',
    exhibitor_number: r.exhibitor?.number ?? null,
    user_id: r.user_id,
    user_name: r.user?.display_name ?? null,
    user_email: r.user?.email ?? null,
    user_role: r.user?.role ?? null,
    stars: r.stars,
    comment: r.comment ?? null,
    comment_status: r.comment_status,
    created_at: r.created_at,
  }));
}

/**
 * Todas as notas dos jurados (por categoria) de um evento, já com quem avaliou
 * e o expositor/categoria. Jurados não deixam comentário — só nota por categoria.
 */
export async function getJurorEvaluationsReport(eventId: string): Promise<JurorEvaluationReportRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('juror_evaluations')
    .select('id, exhibitor_id, user_id, category_id, score, created_at, user:users(display_name, email, role), exhibitor:exhibitors(name, number), category:evaluation_categories(name)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    exhibitor_id: r.exhibitor_id,
    exhibitor_name: r.exhibitor?.name ?? '—',
    exhibitor_number: r.exhibitor?.number ?? null,
    user_id: r.user_id,
    user_name: r.user?.display_name ?? null,
    user_email: r.user?.email ?? null,
    user_role: r.user?.role ?? null,
    category_id: r.category_id,
    category_name: r.category?.name ?? null,
    score: Number(r.score),
    created_at: r.created_at,
  }));
}

// ─── Ranking por estrelas (pós-evento) ───────────────────────────────────────

export interface ParticipantStarRanking {
  exhibitor_id: string;
  exhibitor_name: string;
  exhibitor_number: number | null;
  score: number;   // soma das estrelas dadas (o que decide o ranking)
  voters: number;  // participantes únicos que votaram no expositor
}

// Data local (YYYY-MM-DD) de um timestamp, do ponto de vista de quem visualiza.
// Usada para comparar a data da avaliação com a data do evento.
function localDayKey(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Ranking do pós-evento por estrelas: soma das estrelas (score) dadas por usuários
 * com perfil 'participant', considerando apenas avaliações feitas na data do evento
 * (quando `eventDate` é informado). `voters` = participantes únicos que votaram no
 * expositor. Ordena por score (soma de estrelas) desc, desempate por nº de votantes
 * e depois pelo número do expositor.
 */
export async function getParticipantStarRanking(
  eventId: string,
  eventDate?: string | null,
): Promise<ParticipantStarRanking[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('evaluations')
    .select('exhibitor_id, user_id, stars, created_at, user:users(role), exhibitor:exhibitors(name, number)')
    .eq('event_id', eventId);
  if (error) throw error;

  const dayKey = eventDate ? localDayKey(eventDate) : null;
  const map = new Map<string, { name: string; number: number | null; score: number; voters: Set<string> }>();

  for (const r of (data || []) as any[]) {
    if (r.user?.role !== 'participant') continue;
    if (dayKey && localDayKey(r.created_at) !== dayKey) continue;
    const cur = map.get(r.exhibitor_id) ?? {
      name: r.exhibitor?.name ?? '—',
      number: r.exhibitor?.number ?? null,
      score: 0,
      voters: new Set<string>(),
    };
    cur.score += r.stars;
    cur.voters.add(r.user_id);
    map.set(r.exhibitor_id, cur);
  }

  return [...map.entries()]
    .map(([exhibitor_id, v]) => ({
      exhibitor_id,
      exhibitor_name: v.name,
      exhibitor_number: v.number,
      score: v.score,
      voters: v.voters.size,
    }))
    .sort((a, b) =>
      b.score - a.score ||
      b.voters - a.voters ||
      (a.exhibitor_number ?? 1e9) - (b.exhibitor_number ?? 1e9),
    );
}

// ─── Ranking (View) ──────────────────────────────────────────────────────────

export async function getExhibitorRankings(eventId: string): Promise<ExhibitorRanking[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('view_exhibitor_rankings')
    .select('*')
    .eq('event_id', eventId);
  if (error) throw error;
  return (data || []) as ExhibitorRanking[];
}

export function subscribeToEvaluations(
  eventId: string,
  onUpdate: () => void,
): () => void {
  if (!supabase) return () => {};
  // Escuta mudanças em evaluations e juror_evaluations para atualizar ranking
  const channel = supabase
    .channel(`public:evaluations:${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'evaluations' },
      onUpdate,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'juror_evaluations' },
      onUpdate,
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export function subscribeToAllEvaluations(
  eventId: string,
  onUpdate: () => void,
): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`public:evaluations_moderation:${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'evaluations' },
      onUpdate,
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
