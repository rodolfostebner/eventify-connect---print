import { supabase } from '../lib/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TvConfig {
  id: string;
  event_id: string;
  rotation_paused: boolean;
  active_module: string | null;
  theme: string;
  duration_mod01: number;
  duration_mod02: number;
  duration_mod03: number;
  duration_mod04: number;
  duration_mod05: number;
  duration_mod06: number;
  paused_mod01: boolean;
  paused_mod02: boolean;
  paused_mod03: boolean;
  paused_mod04: boolean;
  paused_mod05: boolean;
  paused_mod06: boolean;
  ticker_show_raffle: boolean;
  ticker_show_alerts: boolean;
  ticker_show_products: boolean;
  ticker_show_no_photo: boolean;
  ticker_speed: number;
  // MOD-04: exibir apenas expositores com foto (false = todos)
  mod04_only_with_photo: boolean;
  // MOD-07 (Promover Stand): stand escolhido + texto/frase customizados.
  // O módulo roda mod07_max_shows vezes (mod07_shows_done conta no telão) e
  // depois fica inativo até outro stand ser promovido.
  duration_mod07: number;
  paused_mod07: boolean;
  mod07_exhibitor_id: string | null;
  mod07_text: string | null;
  mod07_tagline: string | null;
  mod07_max_shows: number;
  mod07_shows_done: number;
  // Header do telão: exibir o total de pessoas no app (contador de presença)
  show_online_count: boolean;
  // Tamanho do texto do telão (%): escala global dos textos (100 = padrão)
  text_scale: number;
  updated_at: string;
}

export interface TvExhibitorSpotlight {
  id: string;
  event_id: string;
  exhibitor_id: string;
  started_at: string;
  ended_at: string | null;
  exhibitor?: {
    name: string;
    logo_url: string | null;
    category: string | null;
  };
}

export interface TvPhotoHistory {
  id: string;
  event_id: string;
  post_id: string;
  module: 'mod01' | 'mod02';
  shown_at: string;
}

// ─── tv_config ───────────────────────────────────────────────────────────────

export async function getTvConfig(eventId: string): Promise<TvConfig | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('tv_config')
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();
  return data;
}

export async function upsertTvConfig(
  eventId: string,
  updates: Partial<Omit<TvConfig, 'id' | 'event_id' | 'updated_at'>>
): Promise<TvConfig | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tv_config')
    .upsert(
      { event_id: eventId, ...updates, updated_at: new Date().toISOString() },
      { onConflict: 'event_id' }
    )
    .select()
    .single();
  // Propaga o erro para o chamador (painel exibe toast) — sem isto, falhas de
  // schema (ex: migration não aplicada) viram "sucesso" silencioso.
  if (error) throw error;
  return data;
}

export function subscribeToTvConfig(eventId: string, cb: (config: TvConfig) => void) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`tv_config:${eventId}:${Math.random().toString(36).slice(2, 9)}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tv_config', filter: `event_id=eq.${eventId}` },
      () => getTvConfig(eventId).then((c) => c && cb(c))
    )
    .subscribe();
  return () => { supabase!.removeChannel(channel); };
}

// ─── tv_exhibitor_spotlight ──────────────────────────────────────────────────

export async function getActiveSpotlights(eventId: string): Promise<TvExhibitorSpotlight[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('tv_exhibitor_spotlight')
    .select('*, exhibitor:exhibitors(name, logo_url, category)')
    .eq('event_id', eventId)
    .is('ended_at', null)
    .order('started_at', { ascending: false });
  return data || [];
}

export async function getSpotlightHistory(eventId: string): Promise<TvExhibitorSpotlight[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('tv_exhibitor_spotlight')
    .select('*, exhibitor:exhibitors(name, logo_url, category)')
    .eq('event_id', eventId)
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(50);
  return data || [];
}

export async function addSpotlight(eventId: string, exhibitorId: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('tv_exhibitor_spotlight')
    .insert({ event_id: eventId, exhibitor_id: exhibitorId });
}

export async function removeSpotlight(spotlightId: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('tv_exhibitor_spotlight')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', spotlightId);
}

export async function clearAllSpotlights(eventId: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('tv_exhibitor_spotlight')
    .update({ ended_at: new Date().toISOString() })
    .eq('event_id', eventId)
    .is('ended_at', null);
}

// ─── tv_photo_history ────────────────────────────────────────────────────────

export async function getShownPhotoIds(
  eventId: string,
  module: 'mod01' | 'mod02'
): Promise<string[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('tv_photo_history')
    .select('post_id')
    .eq('event_id', eventId)
    .eq('module', module);
  return (data || []).map((r) => r.post_id);
}

export async function markPhotoShown(
  eventId: string,
  postId: string,
  module: 'mod01' | 'mod02'
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('tv_photo_history')
    .insert({ event_id: eventId, post_id: postId, module });
}

export async function resetPhotoHistory(
  eventId: string,
  module?: 'mod01' | 'mod02'
): Promise<void> {
  if (!supabase) return;
  const query = supabase
    .from('tv_photo_history')
    .delete()
    .eq('event_id', eventId);
  if (module) query.eq('module', module);
  await query;
}

// ─── Ranking de expositores por avaliações (apoio ao MOD-03) ────────────────

export interface ExhibitorRankingTV {
  exhibitor_id: string;
  name: string;
  logo_url: string | null;
  category: string | null;
  total_avaliacoes: number;
  avaliacoes_ultima_hora: number;
  score: number;
}

export async function getExhibitorRankingForTV(eventId: string): Promise<ExhibitorRankingTV[]> {
  if (!supabase) return [];

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [{ data: rankings }, { data: recentEvals }] = await Promise.all([
    supabase
      .from('view_exhibitor_rankings')
      .select('exhibitor_id, exhibitor_name, logo_url, category, public_count, weighted_score')
      .eq('event_id', eventId),
    supabase
      .from('evaluations')
      .select('exhibitor_id')
      .eq('event_id', eventId)
      .gte('created_at', oneHourAgo),
  ]);

  const recentCount: Record<string, number> = {};
  (recentEvals || []).forEach((e) => {
    recentCount[e.exhibitor_id] = (recentCount[e.exhibitor_id] || 0) + 1;
  });

  return (rankings || []).map((r) => ({
    exhibitor_id: r.exhibitor_id,
    name: r.exhibitor_name,
    logo_url: r.logo_url,
    category: r.category,
    total_avaliacoes: r.public_count || 0,
    avaliacoes_ultima_hora: recentCount[r.exhibitor_id] || 0,
    score: r.weighted_score || 0,
  })).sort((a, b) => b.total_avaliacoes - a.total_avaliacoes);
}
