import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Play, Edit2, Check, Clock, ChevronRight, Package,
  Users, Star, Loader2, ArrowLeft, AlertTriangle, Minus, Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppHeader } from '../../components/AppHeader';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import type { EventData, Exhibitor, EvaluationCategory, JurorEvaluation } from '../../types';
import { getEventById, getEventBySlug } from '../../services/eventService';
import { getExhibitors } from '../../services/exhibitorService';
import { getProductsByExhibitorIds } from '../../services/productService';
import {
  getEvaluationCategories,
  getJurorEvaluationsForEvent,
  submitJurorEvaluations,
  getExhibitorPublicStats,
  type ExhibitorPublicStats,
} from '../../services/evaluationService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Abrevia nomes longos de categoria para caber na coluna da tabela.
// Estratégia: remove palavras de parada, abrevia cada palavra relevante com até 4 chars + ponto.
const STOP_WORDS = new Set(['de', 'do', 'da', 'dos', 'das', 'e', 'a', 'o', 'em', 'no', 'na', 'com', 'para']);

function abbreviateCategoryName(name: string): string {
  if (name.length <= 12) return name;
  const words = name.split(/\s+/);
  const relevant = words.filter(w => !STOP_WORDS.has(w.toLowerCase()));
  // Se ficou com poucas palavras, abrevia cada uma
  const abbreviated = relevant.map(w =>
    w.length > 5 ? w.slice(0, 4) + '.' : w,
  );
  const result = abbreviated.join(' ');
  return result.length < name.length ? result : name;
}

function sortByAno(exhibitors: Exhibitor[]): Exhibitor[] {
  return [...exhibitors].sort((a, b) => {
    const aNum = parseInt(a.ano || '') || 9999;
    const bNum = parseInt(b.ano || '') || 9999;
    if (aNum !== bNum) return aNum - bNum;
    return (a.turma || '').localeCompare(b.turma || '');
  });
}

function evalStatus(
  exhibitorId: string,
  evals: JurorEvaluation[],
  categories: EvaluationCategory[],
): 'avaliado' | 'parcial' | 'pendente' {
  const mine = evals.filter(e => e.exhibitor_id === exhibitorId);
  if (mine.length === 0) return 'pendente';
  if (mine.length >= categories.length && categories.length > 0) return 'avaliado';
  return 'parcial';
}

function avgScore(exhibitorId: string, evals: JurorEvaluation[]): number | null {
  const scores = evals.filter(e => e.exhibitor_id === exhibitorId).map(e => Number(e.score));
  if (scores.length === 0) return null;
  return scores.reduce((s, v) => s + v, 0) / scores.length;
}

function scoreForCategory(
  exhibitorId: string,
  categoryId: string,
  evals: JurorEvaluation[],
): number | null {
  const e = evals.find(ev => ev.exhibitor_id === exhibitorId && ev.category_id === categoryId);
  return e ? Number(e.score) : null;
}

function buildInitialScores(
  exhibitorId: string,
  categories: EvaluationCategory[],
  evals: JurorEvaluation[],
): Record<string, string> {
  return Object.fromEntries(
    categories.map(cat => {
      const existing = evals.find(e => e.exhibitor_id === exhibitorId && e.category_id === cat.id);
      return [cat.id, existing ? Number(existing.score).toFixed(1) : '0.0'];
    }),
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'avaliado' | 'parcial' | 'pendente' }) {
  if (status === 'avaliado') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
        <Check className="w-2.5 h-2.5" /> Avaliado
      </span>
    );
  }
  if (status === 'parcial') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
        <Clock className="w-2.5 h-2.5" /> Parcial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
      <Clock className="w-2.5 h-2.5" /> Pendente
    </span>
  );
}

function ScoreInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const num = parseFloat(value) || 0;

  const step = (delta: number) => {
    const next = Math.max(0, Math.min(5, Math.round((num + delta) * 10) / 10));
    onChange(next.toFixed(1));
  };

  const handleInput = (raw: string) => {
    const v = parseFloat(raw);
    if (isNaN(v)) { onChange('0.0'); return; }
    onChange(Math.max(0, Math.min(5, Math.round(v * 10) / 10)).toFixed(1));
  };

  const pct = (num / 5) * 100;

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-neutral-100 last:border-b-0">
      <span className="flex-1 text-sm font-medium text-neutral-800 min-w-0 truncate">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => step(-0.5)}
          disabled={disabled || num <= 0}
          className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold disabled:opacity-30 transition-colors flex items-center justify-center select-none"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="relative w-14">
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={value}
            onChange={e => handleInput(e.target.value)}
            disabled={disabled}
            className="w-full text-center text-lg font-bold tabular-nums border-2 border-neutral-200 rounded-xl py-1.5 focus:outline-none focus:border-neutral-900 bg-white disabled:bg-neutral-50 disabled:text-neutral-400"
          />
        </div>
        <button
          type="button"
          onClick={() => step(0.5)}
          disabled={disabled || num >= 5}
          className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold disabled:opacity-30 transition-colors flex items-center justify-center select-none"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="w-12 h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-900 rounded-full transition-all duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] text-neutral-400 w-8 text-right">/ 5.0</span>
      </div>
    </div>
  );
}

function CommunityStatsSection({ exhibitorId }: { exhibitorId: string }) {
  const [stats, setStats] = useState<ExhibitorPublicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getExhibitorPublicStats(exhibitorId)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [exhibitorId]);

  return (
    <div className="bg-neutral-50 rounded-2xl p-4 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Dados da Comunidade</p>
      {loading ? (
        <div className="flex items-center gap-2 text-neutral-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-xs">Carregando...</span>
        </div>
      ) : !stats ? (
        <p className="text-xs text-neutral-400">Não foi possível carregar os dados.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">Visitantes Pré-evento</p>
            <p className="text-lg font-black text-neutral-900 tabular-nums">{stats.visitors_pre}</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">Visitantes Live</p>
            <p className="text-lg font-black text-neutral-900 tabular-nums">{stats.visitors_live}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">Avaliações do Público</p>
            {stats.evaluation_count === 0 ? (
              <p className="text-xs text-neutral-400 mt-0.5">Nenhuma avaliação ainda</p>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-neutral-900">
                  {stats.avg_stars?.toFixed(1) ?? '—'}
                </span>
                <span className="text-xs text-neutral-400">
                  ({stats.evaluation_count} {stats.evaluation_count === 1 ? 'avaliação' : 'avaliações'})
                </span>
              </div>
            )}
          </div>
          {/* ⏳ Comentários da comunidade — pendente de implementação (avaliação da comunidade UI) */}
        </div>
      )}
    </div>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function AvaliadorPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const { user, loading: authLoading } = useAuth();

  // Admin/event_admin acessam via /avaliacao/:slug em modo somente leitura
  const isAdminView = user?.role === 'admin' || user?.role === 'event_admin';

  const [event, setEvent] = useState<EventData | null>(null);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [categories, setCategories] = useState<EvaluationCategory[]>([]);
  const [myEvals, setMyEvals] = useState<JurorEvaluation[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Fluxo de avaliação
  const [view, setView] = useState<'table' | 'card'>('table');
  const [cardIndex, setCardIndex] = useState(0);
  const [isSingleEdit, setIsSingleEdit] = useState(false);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Redirect se não tiver permissão
  useEffect(() => {
    if (authLoading) return;
    const allowed = user?.role === 'avaliador' || user?.role === 'admin' || user?.role === 'event_admin';
    if (!user || !allowed) navigate('/login', { replace: true });
  }, [user, authLoading, navigate]);

  const loadData = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }

    // Admin acessa pelo slug da rota; avaliador pelo event_id do próprio usuário
    const eventIdOrSlug = slug ?? user.event_id;
    if (!eventIdOrSlug) { setLoading(false); return; }

    setLoading(true);
    try {
      const evData = slug
        ? await getEventBySlug(slug)
        : await getEventById(user.event_id!);

      if (!evData) { setLoading(false); return; }

      const eventId = evData.id;
      const [exhibData, catData, evalsData] = await Promise.all([
        getExhibitors(eventId),
        getEvaluationCategories(eventId),
        isAdminView ? Promise.resolve([] as JurorEvaluation[]) : getJurorEvaluationsForEvent(eventId, user.id),
      ]);
      setEvent(evData);
      setCategories(catData);
      setMyEvals(evalsData);

      const sorted = sortByAno(exhibData);
      setExhibitors(sorted);

      // Contagem de produtos por expositor (batch)
      if (sorted.length > 0) {
        const products = await getProductsByExhibitorIds(sorted.map(e => e.id));
        const counts: Record<string, number> = {};
        for (const p of products) {
          if (p.active) counts[p.exhibitor_id] = (counts[p.exhibitor_id] || 0) + 1;
        }
        setProductCounts(counts);
      }
    } catch {
      toast.error('Erro ao carregar dados de avaliação');
    } finally {
      setLoading(false);
    }
  }, [user, slug, isAdminView]);

  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [user, authLoading, loadData]);

  // Admin acessa em modo leitura; avaliador só pode submeter se avaliações estiverem abertas
  const isEvaluationOpen = !isAdminView
    && event?.evaluation_status !== 'closed'
    && event?.evaluation_status !== 'published';

  // Abre o card de avaliação
  const openCard = (index: number, singleEdit: boolean) => {
    const exhib = exhibitors[index];
    if (!exhib) return;
    setScores(buildInitialScores(exhib.id, categories, myEvals));
    setCardIndex(index);
    setIsSingleEdit(singleEdit);
    setView('card');
  };

  // Salva as notas do expositor atual
  const handleSave = async () => {
    if (!user?.id || !event?.id) return;
    const exhib = exhibitors[cardIndex];
    if (!exhib) return;

    const payload = categories.map(cat => ({
      event_id: event.id,
      exhibitor_id: exhib.id,
      user_id: user.id,
      category_id: cat.id,
      score: parseFloat(scores[cat.id] || '0') as number,
    }));

    setSaving(true);
    try {
      await submitJurorEvaluations(payload);
      // Atualiza estado local sem refetch completo
      setMyEvals(prev => {
        const without = prev.filter(e => !(e.exhibitor_id === exhib.id && categories.some(c => c.id === e.category_id)));
        const next: JurorEvaluation[] = payload.map(p => ({
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...p,
        }));
        return [...without, ...next];
      });
      toast.success('Avaliação salva');

      const isLast = cardIndex >= exhibitors.length - 1;
      if (isSingleEdit || isLast) {
        setView('table');
      } else {
        const next = exhibitors[cardIndex + 1];
        setScores(buildInitialScores(next.id, categories, myEvals));
        setCardIndex(i => i + 1);
      }
    } catch {
      toast.error('Erro ao salvar avaliação');
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading / Guard ──────────────────────────────────────────────────────

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 text-neutral-300 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (!event) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppHeader title="Avaliação" />
        <main className="max-w-3xl mx-auto p-6">
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-neutral-700">Evento não encontrado</p>
            <p className="text-xs text-neutral-400 mt-1">Sua conta não está vinculada a nenhum evento.</p>
          </div>
        </main>
      </div>
    );
  }

  // ─── Card de Avaliação ────────────────────────────────────────────────────

  if (view === 'card') {
    const exhib = exhibitors[cardIndex];
    if (!exhib) { setView('table'); return null; }

    const isLast = cardIndex >= exhibitors.length - 1;
    const anoLabel = exhib.ano ? `${exhib.ano}º Ano` : null;
    const turmaLabel = exhib.turma ? `Turma ${exhib.turma}` : null;

    return (
      <div className="min-h-screen bg-neutral-50">
        <AppHeader title={event.name || 'Avaliação'} />

        <main className="max-w-2xl mx-auto p-4 pb-24 space-y-4">
          {/* Cabeçalho de navegação */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView('table')}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar à lista
            </button>
            <span className="text-xs font-bold text-neutral-400 tabular-nums">
              {cardIndex + 1} / {exhibitors.length}
            </span>
          </div>

          {/* Destaque do Ano — contexto de exigência */}
          {(anoLabel || turmaLabel) && (
            <div className="bg-neutral-900 text-white rounded-2xl px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {anoLabel && (
                  <span className="text-xl font-black">{anoLabel}</span>
                )}
                {turmaLabel && (
                  <span className="text-sm font-medium text-neutral-300">{turmaLabel}</span>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Calibre a exigência
              </span>
            </div>
          )}

          {/* Card do Expositor */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-4">
            <div className="flex items-start gap-4">
              {exhib.logo_url ? (
                <img
                  src={exhib.logo_url}
                  alt={exhib.name}
                  className="w-16 h-16 rounded-xl object-cover border border-neutral-100 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center text-2xl shrink-0">
                  🏪
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-neutral-900 text-base leading-tight">{exhib.name}</p>
                {exhib.tagline && (
                  <p className="text-sm text-neutral-500 mt-0.5 italic">"{exhib.tagline}"</p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {exhib.category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-full">
                      {exhib.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                    <Package className="w-3 h-3" />
                    {productCounts[exhib.id] || 0} produto{(productCounts[exhib.id] || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Dados da Comunidade */}
            <CommunityStatsSection exhibitorId={exhib.id} />

            {/* Integrantes */}
            {(exhib.members && exhib.members.length > 0) && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  <Users className="w-3 h-3 inline mr-1" />Integrantes
                </p>
                <p className="text-sm text-neutral-700">{exhib.members.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Notas por Categoria */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <p className="text-sm font-bold text-neutral-800 mb-1">Avaliação por Critério</p>
            <p className="text-[10px] text-neutral-400 mb-4">Escala de 0.0 a 5.0 · incremento de 0.5</p>
            {categories.length === 0 ? (
              <div className="text-center py-6 text-neutral-400">
                <p className="text-sm">Nenhuma categoria configurada</p>
                <p className="text-xs mt-1">O administrador do evento ainda não cadastrou as categorias de avaliação.</p>
              </div>
            ) : (
              <div>
                {categories.map(cat => (
                  <ScoreInput
                    key={cat.id}
                    label={cat.name}
                    value={scores[cat.id] ?? '0.0'}
                    onChange={v => setScores(prev => ({ ...prev, [cat.id]: v }))}
                    disabled={!isEvaluationOpen}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Aviso se avaliações encerradas */}
          {!isEvaluationOpen && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium">
                {event.evaluation_status === 'published'
                  ? 'O ranking já foi publicado. As avaliações estão encerradas.'
                  : 'As avaliações foram encerradas pelo administrador. Aguarde a reabertura.'}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3">
            <button
              onClick={() => setView('table')}
              className="px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-bold transition-colors"
            >
              Cancelar
            </button>
            {isEvaluationOpen && categories.length > 0 && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {!isSingleEdit && !isLast ? (
                      <>Salvar e Próximo <ChevronRight className="w-4 h-4" /></>
                    ) : (
                      <><Check className="w-4 h-4" /> Salvar</>
                    )}
                  </>
                )}
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ─── Tabela de Expositores ────────────────────────────────────────────────

  const allEvaluated = exhibitors.length > 0 &&
    exhibitors.every(ex => evalStatus(ex.id, myEvals, categories) === 'avaliado');

  const firstPendingIndex = exhibitors.findIndex(
    ex => evalStatus(ex.id, myEvals, categories) !== 'avaliado',
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader title={isAdminView ? `Avaliação — ${event.name}` : 'Área do Avaliador'} />

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
        {/* Header do evento */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="font-black text-neutral-900 text-base leading-tight truncate">{event.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                event.evaluation_status === 'published'
                  ? 'bg-blue-100 text-blue-700'
                  : event.evaluation_status === 'closed'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700',
              )}>
                {event.evaluation_status === 'published' ? '● Resultado publicado'
                  : event.evaluation_status === 'closed' ? '● Avaliações encerradas'
                  : '● Avaliações abertas'}
              </span>
              <span className="text-xs text-neutral-400">
                {exhibitors.length} expositor{exhibitors.length !== 1 ? 'es' : ''}
                {' · '}
                {myEvals.filter((e, i, arr) => arr.findIndex(x => x.exhibitor_id === e.exhibitor_id) === i).length} avaliado{myEvals.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {isEvaluationOpen && exhibitors.length > 0 && categories.length > 0 && (
            <button
              onClick={() => openCard(firstPendingIndex >= 0 ? firstPendingIndex : 0, false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-bold transition-colors shrink-0"
            >
              <Play className="w-4 h-4" />
              {allEvaluated ? 'Revisar Avaliações' : 'Iniciar Avaliação'}
            </button>
          )}
        </div>

        {/* Banner modo leitura para admin */}
        {isAdminView && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 font-medium">
              Visão administrativa — somente leitura. Para avaliar, acesse com uma conta de avaliador.
            </p>
          </div>
        )}

        {/* Aviso sem categorias */}
        {categories.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">Nenhuma categoria de avaliação</p>
              <p className="text-xs text-amber-600 mt-0.5">
                O administrador do evento ainda não cadastrou os critérios de avaliação. Aguarde.
              </p>
            </div>
          </div>
        )}

        {/* Tabela */}
        {exhibitors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center text-neutral-400">
            <p className="text-sm">Nenhum expositor cadastrado neste evento.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-[10px] uppercase text-neutral-400 font-bold tracking-wider border-b border-neutral-100">
                  <tr>
                    <th className="px-4 py-3 w-12">Logo</th>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3 hidden md:table-cell">Categoria</th>
                    <th className="px-4 py-3">Ano</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Turma</th>
                    {categories.map(cat => (
                      <th key={cat.id} className="px-3 py-3 text-right hidden lg:table-cell max-w-[80px]">
                        <span className="block leading-tight break-words hyphens-auto" lang="pt">
                          {abbreviateCategoryName(cat.name)}
                        </span>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-right">Média</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {exhibitors.map((ex, idx) => {
                    const status = evalStatus(ex.id, myEvals, categories);
                    const avg = avgScore(ex.id, myEvals);
                    return (
                      <tr key={ex.id} className="hover:bg-neutral-50 transition-colors">
                        {/* Logo */}
                        <td className="px-4 py-3">
                          {ex.logo_url ? (
                            <img
                              src={ex.logo_url}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover border border-neutral-100"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-base">
                              🏪
                            </div>
                          )}
                        </td>

                        {/* Nome */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-neutral-900 whitespace-nowrap">{ex.name}</p>
                          {ex.tagline && (
                            <p className="text-[10px] text-neutral-400 truncate max-w-[160px]">{ex.tagline}</p>
                          )}
                        </td>

                        {/* Categoria */}
                        <td className="px-4 py-3 text-neutral-500 whitespace-nowrap hidden md:table-cell">
                          {ex.category || '—'}
                        </td>

                        {/* Ano */}
                        <td className="px-4 py-3 font-medium text-neutral-700 whitespace-nowrap">
                          {ex.ano ? `${ex.ano}º` : '—'}
                        </td>

                        {/* Turma */}
                        <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">
                          {ex.turma || '—'}
                        </td>

                        {/* Notas por categoria */}
                        {categories.map(cat => {
                          const s = scoreForCategory(ex.id, cat.id, myEvals);
                          return (
                            <td key={cat.id} className="px-3 py-3 text-right tabular-nums hidden lg:table-cell">
                              {s !== null ? (
                                <span className="font-medium text-neutral-900">{s.toFixed(1)}</span>
                              ) : (
                                <span className="text-neutral-300">—</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Média */}
                        <td className="px-3 py-3 text-right tabular-nums">
                          {avg !== null ? (
                            <span className="font-bold text-neutral-900">{avg.toFixed(1)}</span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={status} />
                        </td>

                        {/* Ação */}
                        <td className="px-4 py-3 text-right">
                          {status === 'pendente' && isEvaluationOpen ? (
                            <button
                              onClick={() => openCard(idx, false)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 text-white text-[11px] font-bold hover:bg-neutral-700 transition-colors ml-auto"
                            >
                              <Play className="w-3 h-3" /> Avaliar
                            </button>
                          ) : (status === 'avaliado' || status === 'parcial') ? (
                            <button
                              onClick={() => openCard(idx, true)}
                              disabled={!isEvaluationOpen}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 text-[11px] font-bold hover:bg-neutral-50 transition-colors ml-auto disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Edit2 className="w-3 h-3" /> Alterar
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
