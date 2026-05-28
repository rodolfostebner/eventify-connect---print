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
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('evaluations')
    .update({ stars, comment })
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
    .insert(evaluations);
  if (error) {
    if (error.code === '23505') {
      throw new Error('Você já avaliou este expositor nesta(s) categoria(s).');
    }
    throw error;
  }
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
    .channel(`public:evaluations:event_id=eq.${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'evaluations', filter: `event_id=eq.${eventId}` },
      onUpdate,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'juror_evaluations', filter: `event_id=eq.${eventId}` },
      onUpdate,
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
