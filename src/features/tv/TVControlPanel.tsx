import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Play, Pause, SkipForward, Tv, Users, Image, Star, Megaphone,
  Trophy, Ticket, Zap, RotateCcw, ArrowLeft, Check, X, Clock,
  Eye, EyeOff, ChevronUp, ChevronDown, RefreshCw, Loader2, Monitor,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { EventData, PhotoData, Announcement, RafflePrize } from '../../types';
import { subscribeToEvent, updateEvent } from '../../services/eventService';
import { fetchAllPosts, updatePostStatus } from '../../services/posts';
import { getAnnouncements, triggerAnnouncement } from '../../services/announcementService';
import { getPrizes, drawPrize, setTvRaffleState, getTicketCount } from '../../services/raffleService';
import {
  getTvConfig, upsertTvConfig, subscribeToTvConfig,
  getActiveSpotlights, getSpotlightHistory, addSpotlight, removeSpotlight, clearAllSpotlights,
  getExhibitorRankingForTV, getShownPhotoIds, resetPhotoHistory,
  type TvConfig, type TvExhibitorSpotlight, type ExhibitorRankingTV,
} from '../../services/tvService';
import { getExhibitors } from '../../services/exhibitorService';
import type { Exhibitor } from '../../types';
import { useAuth } from '../../hooks/useAuth';

// ─── Constantes ──────────────────────────────────────────────────────────────

const MODULES = [
  { id: 'mod01', label: 'Rank de Fotos',        icon: Star,     color: 'blue'   },
  { id: 'mod02', label: 'Carrossel de Fotos',   icon: Image,    color: 'cyan'   },
  { id: 'mod03', label: 'Expositor Destaque',   icon: Star,     color: 'amber'  },
  { id: 'mod04', label: 'Trio de Expositores',  icon: Users,    color: 'orange' },
  { id: 'mod05', label: 'Parceiros',            icon: Tv,       color: 'purple' },
  { id: 'mod06', label: 'Marketing',            icon: Megaphone,color: 'pink'   },
] as const;

type ModuleId = typeof MODULES[number]['id'];

const MODULE_COLOR: Record<string, string> = {
  blue:   'bg-blue-50 border-blue-200 text-blue-700',
  cyan:   'bg-cyan-50 border-cyan-200 text-cyan-700',
  amber:  'bg-amber-50 border-amber-200 text-amber-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  pink:   'bg-pink-50 border-pink-200 text-pink-700',
};

const THEMES = [
  { id: 'default',      label: 'Padrão' },
  { id: 'pop-yearbook', label: 'Pop Yearbook' },
];

const DEFAULT_CONFIG: Omit<TvConfig, 'id' | 'event_id' | 'updated_at'> = {
  rotation_paused: false,
  active_module: null,
  theme: 'default',
  duration_mod01: 15, duration_mod02: 8,  duration_mod03: 12,
  duration_mod04: 12, duration_mod05: 10, duration_mod06: 10,
  paused_mod01: false, paused_mod02: false, paused_mod03: false,
  paused_mod04: false, paused_mod05: false, paused_mod06: false,
  ticker_show_raffle: true,  ticker_show_alerts: true,
  ticker_show_products: true, ticker_show_no_photo: false,
  ticker_speed: 50,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionTitle({ color, icon: Icon, title, subtitle }: {
  color: string; icon: React.ElementType; title: string; subtitle?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2 px-4 py-3 rounded-xl mb-3', color)}>
      <Icon className="w-4 h-4 shrink-0" />
      <div>
        <p className="text-sm font-bold leading-none">{title}</p>
        {subtitle && <p className="text-[10px] mt-0.5 opacity-70">{subtitle}</p>}
      </div>
    </div>
  );
}

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative w-10 h-5 rounded-full transition-colors shrink-0 disabled:opacity-40',
        value ? 'bg-neutral-900' : 'bg-neutral-300'
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
        value ? 'translate-x-5' : 'translate-x-0.5'
      )} />
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TVControlPanel() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState<'controle' | 'curadoria'>('controle');
  const [event, setEvent] = useState<EventData | null>(null);
  const [config, setConfig] = useState<TvConfig | null>(null);
  const [saving, setSaving] = useState(false);

  // Expositores
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [spotlights, setSpotlights] = useState<TvExhibitorSpotlight[]>([]);
  const [spotlightHistory, setSpotlightHistory] = useState<TvExhibitorSpotlight[]>([]);
  const [ranking, setRanking] = useState<ExhibitorRankingTV[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fotos
  const [shownMod01, setShownMod01] = useState(0);
  const [shownMod02, setShownMod02] = useState(0);
  const [totalPhotos, setTotalPhotos] = useState(0);

  // Avisos
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Sorteio
  const [prizes, setPrizes] = useState<RafflePrize[]>([]);
  const [ticketCount, setTicketCount] = useState(0);
  const [drawing, setDrawing] = useState<string | null>(null);

  // Curadoria
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // ─── Carregamento inicial ───────────────────────────────────────────────────

  useEffect(() => {
    if (!slug) return;
    return subscribeToEvent(slug, async (ev) => {
      if (!ev) return;
      setEvent(ev);

      const [cfgRaw, exs, spots, hist, rank, ann, priz, tickets] = await Promise.all([
        getTvConfig(ev.id),
        getExhibitors(ev.id),
        getActiveSpotlights(ev.id),
        getSpotlightHistory(ev.id),
        getExhibitorRankingForTV(ev.id),
        getAnnouncements(ev.id),
        getPrizes(ev.id),
        getTicketCount(ev.id),
      ]);

      // Inicializa config automaticamente se não existir ainda
      const cfg = cfgRaw ?? await upsertTvConfig(ev.id, {});
      setConfig(cfg);
      setExhibitors(exs);
      setSpotlights(spots);
      setSpotlightHistory(hist);
      setRanking(rank);
      setAnnouncements(ann);
      setPrizes(priz);
      setTicketCount(tickets);

      const [s1, s2, allPosts] = await Promise.all([
        getShownPhotoIds(ev.id, 'mod01'),
        getShownPhotoIds(ev.id, 'mod02'),
        fetchAllPosts(ev.id),
      ]);
      setShownMod01(s1.length);
      setShownMod02(s2.length);
      setTotalPhotos(allPosts.filter(p => p.status === 'approved').length);
    }, console.error);
  }, [slug]);

  useEffect(() => {
    if (!event) return;
    let active = true;
    const unsub = subscribeToTvConfig(event.id, setConfig);
    // Polling de fallback: reflete mudanças feitas pelo telão (ex: módulo
    // forçado que termina e volta à rotação) mesmo sem realtime.
    const poll = setInterval(() => {
      getTvConfig(event.id).then((c) => active && c && setConfig(c));
    }, 4000);
    return () => { active = false; unsub(); clearInterval(poll); };
  }, [event?.id]);

  // ─── Curadoria: carregar fotos quando muda para a aba ──────────────────────

  useEffect(() => {
    if (tab !== 'curadoria' || !event) return;
    setLoadingPhotos(true);
    fetchAllPosts(event.id).then((data) => {
      setPhotos(data);
      setLoadingPhotos(false);
    });
  }, [tab, event?.id]);

  // ─── Salvar config ─────────────────────────────────────────────────────────

  const save = useCallback(async (updates: Partial<TvConfig>) => {
    if (!event) return;
    setSaving(true);
    try {
      const updated = await upsertTvConfig(event.id, updates);
      if (updated) setConfig(updated);
    } catch {
      toast.error('Erro ao salvar configuração.');
    } finally {
      setSaving(false);
    }
  }, [event]);

  // Força o telão a re-puxar config + conteúdo (bump em updated_at).
  const refreshTv = useCallback(async () => {
    if (!event) return;
    await save({});
    toast.success('Telão atualizado');
  }, [event, save]);

  // cfg: config atual com fallback para defaults (nunca null)
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // ─── Ações de módulo ───────────────────────────────────────────────────────

  function togglePaused(mod: ModuleId) {
    const key = `paused_${mod}` as keyof typeof DEFAULT_CONFIG;
    save({ [key]: !cfg[key] });
  }

  function setDuration(mod: ModuleId, value: number) {
    if (value < 3) return;
    save({ [`duration_${mod}` as keyof TvConfig]: value });
  }

  function forceModule(mod: ModuleId | null) {
    save({ active_module: mod });
    if (mod) toast.success(`Módulo forçado: ${MODULES.find(m => m.id === mod)?.label}`);
    else toast.success('Rotação automática retomada');
  }

  // ─── Spotlight ─────────────────────────────────────────────────────────────

  async function handleAddSpotlight(exhibitorId: string) {
    if (!event) return;
    const already = spotlights.some(s => s.exhibitor_id === exhibitorId);
    if (already) { toast.error('Expositor já está em destaque'); return; }
    await addSpotlight(event.id, exhibitorId);
    const updated = await getActiveSpotlights(event.id);
    setSpotlights(updated);
    toast.success('Expositor adicionado ao destaque');
  }

  async function handleRemoveSpotlight(spotlightId: string) {
    await removeSpotlight(spotlightId);
    setSpotlights(prev => prev.filter(s => s.id !== spotlightId));
    toast.success('Removido do destaque');
  }

  async function handleClearSpotlights() {
    if (!event) return;
    await clearAllSpotlights(event.id);
    const hist = await getSpotlightHistory(event.id);
    setSpotlights([]);
    setSpotlightHistory(hist);
    toast.success('Todos os destaques encerrados');
  }

  // ─── Histórico de fotos ────────────────────────────────────────────────────

  async function handleResetPhotoHistory(mod: 'mod01' | 'mod02') {
    if (!event) return;
    await resetPhotoHistory(event.id, mod);
    if (mod === 'mod01') setShownMod01(0);
    else setShownMod02(0);
    toast.success('Histórico de fotos resetado');
  }

  // ─── Avisos ────────────────────────────────────────────────────────────────

  async function handleTriggerAnnouncement(id: string | null) {
    if (!event) return;
    await triggerAnnouncement(event.id, id);
    toast.success(id ? 'Aviso disparado no telão' : 'Aviso encerrado');
  }

  // ─── Sorteio ───────────────────────────────────────────────────────────────

  async function handleShowPrize(prize: RafflePrize) {
    if (!event) return;
    await setTvRaffleState(event.id, 'showing_prize', prize.id);
    setEvent(ev => ev ? { ...ev, tv_raffle_state: 'showing_prize', tv_raffle_prize_id: prize.id } : ev);
    toast.success(`"${prize.name}" exibido no telão`);
  }

  async function handleDraw(prize: RafflePrize) {
    if (!event) return;
    if (ticketCount === 0) { toast.error('Nenhum participante no sorteio'); return; }
    setDrawing(prize.id);
    try {
      const winner = await drawPrize(prize.id, event.id);
      if (winner) {
        setEvent(ev => ev ? { ...ev, tv_raffle_state: 'showing_winner', tv_raffle_prize_id: prize.id } : ev);
        toast.success(`Ganhador(a): ${winner.user?.display_name || winner.user?.email}`);
        setPrizes(await getPrizes(event.id));
      }
    } catch {
      toast.error('Erro ao realizar sorteio');
    } finally {
      setDrawing(null);
    }
  }

  async function handleCloseRaffle() {
    if (!event) return;
    await setTvRaffleState(event.id, 'idle', null);
    setEvent(ev => ev ? { ...ev, tv_raffle_state: 'idle', tv_raffle_prize_id: null } : ev);
    toast.success('Sorteio encerrado no telão');
  }

  // ─── Curadoria ─────────────────────────────────────────────────────────────

  async function handleApprove(id: string) {
    await updatePostStatus(id, 'approved');
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
  }

  async function handleReject(id: string) {
    await updatePostStatus(id, 'rejected');
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
    </div>
  );

  const pendingPhotos = photos.filter(p => p.status === 'pending');
  const tvState = event.tv_raffle_state ?? 'idle';

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* Header */}
      <div className="sticky top-0 z-50 bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Monitor className="w-4 h-4 text-neutral-400" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-neutral-400 leading-none">Painel do Telão</p>
          <p className="text-sm font-bold truncate">{event.name}</p>
        </div>

        {/* Atualizar telão */}
        <button
          onClick={refreshTv}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-xs font-semibold transition-colors"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', saving && 'animate-spin')} />
          Atualizar Telão
        </button>

        {/* Status do telão */}
        <a
          href={`/tv/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Ver Telão
        </a>

        {/* Tabs */}
        <div className="flex bg-neutral-800 rounded-xl p-1 gap-1">
          {(['controle', 'curadoria'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize relative',
                tab === t ? 'bg-white text-neutral-900' : 'text-neutral-400 hover:text-white'
              )}
            >
              {t}
              {t === 'curadoria' && pendingPhotos.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">
                  {pendingPhotos.length > 9 ? '9+' : pendingPhotos.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Controle ── */}
      {tab === 'controle' && (
        <div className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4 max-w-[1600px] mx-auto">

          {/* Coluna esquerda: Rotação + Módulos */}
          <div className="xl:col-span-2 space-y-4">

            {/* ── Rotação Geral ── */}
            <div className="bg-neutral-900 rounded-2xl p-4">
              <SectionTitle color="bg-slate-800 text-slate-200" icon={SkipForward} title="Rotação Automática" subtitle="Controle global da sequência de módulos" />
              <div className="flex flex-wrap items-center gap-3">

                {/* Pause/Resume */}
                <button
                  onClick={() => save({ rotation_paused: !cfg.rotation_paused })}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-colors',
                    cfg.rotation_paused
                      ? 'bg-green-500 hover:bg-green-400 text-white'
                      : 'bg-red-500 hover:bg-red-400 text-white'
                  )}
                >
                  {cfg.rotation_paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {cfg.rotation_paused ? 'Retomar Rotação' : 'Pausar Rotação'}
                </button>

                {/* Tema */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Tema:</span>
                  <select
                    value={cfg.theme}
                    onChange={(e) => save({ theme: e.target.value })}
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {THEMES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Forçar módulo / limpar */}
                {cfg.active_module && (
                  <button
                    onClick={() => forceModule(null)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs text-yellow-400 border border-yellow-400/30"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Retomar rotação automática
                  </button>
                )}
              </div>

              {/* Forçar módulo */}
              <div className="mt-4">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-2">Ir direto para módulo</p>
                <div className="flex flex-wrap gap-2">
                  {MODULES.map(m => (
                    <button
                      key={m.id}
                      onClick={() => forceModule(m.id as ModuleId)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                        cfg.active_module === m.id
                          ? 'bg-yellow-400 border-yellow-400 text-neutral-900'
                          : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300'
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Módulos ── */}
            <div className="bg-neutral-900 rounded-2xl p-4">
              <SectionTitle color="bg-indigo-900/50 text-indigo-300" icon={Tv} title="Módulos" subtitle="Ative, pause e configure a duração de cada módulo" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MODULES.map(m => {
                  const pausedKey = `paused_${m.id}` as keyof TvConfig;
                  const durationKey = `duration_${m.id}` as keyof TvConfig;
                  const isPaused = Boolean(cfg[pausedKey]);
                  const duration = Number(cfg[durationKey]);
                  const isActive = cfg.active_module === m.id;

                  // Estatísticas por módulo
                  let stats: React.ReactNode = null;
                  if (m.id === 'mod01') stats = (
                    <p className="text-[10px] text-neutral-500">{totalPhotos} fotos disponíveis</p>
                  );
                  if (m.id === 'mod02') stats = (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-neutral-500">{shownMod02}/{totalPhotos} exibidas</p>
                        <button onClick={() => handleResetPhotoHistory('mod02')} title="Resetar histórico" className="text-neutral-600 hover:text-neutral-400">
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                      {totalPhotos > 0 && (
                        <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${Math.min(100, (shownMod02 / totalPhotos) * 100)}%` }} />
                        </div>
                      )}
                    </div>
                  );
                  if (m.id === 'mod03') stats = (
                    <p className="text-[10px] text-neutral-500">{spotlights.length} em destaque agora</p>
                  );

                  return (
                    <div key={m.id} className={cn(
                      'rounded-xl border p-3 transition-all',
                      isActive ? 'border-yellow-400/60 bg-yellow-400/5' :
                      isPaused ? 'border-neutral-800 bg-neutral-800/30 opacity-60' :
                      'border-neutral-800 bg-neutral-800/50'
                    )}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shrink-0" />}
                          <p className="text-xs font-semibold leading-tight">{m.label}</p>
                        </div>
                        <button
                          onClick={() => togglePaused(m.id as ModuleId)}
                          className={cn(
                            'shrink-0 px-3 py-1 rounded-lg text-[11px] font-bold transition-colors',
                            isPaused
                              ? 'bg-neutral-600 hover:bg-neutral-500 text-neutral-100'
                              : 'bg-green-500 hover:bg-green-400 text-white'
                          )}
                        >
                          {isPaused ? 'Inativo' : 'Ativo'}
                        </button>
                      </div>

                      {stats && <div className="mb-2">{stats}</div>}

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-neutral-500 shrink-0" />
                        <button onClick={() => setDuration(m.id as ModuleId, duration - 1)} className="w-5 h-5 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 rounded text-xs">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono w-8 text-center">{duration}s</span>
                        <button onClick={() => setDuration(m.id as ModuleId, duration + 1)} className="w-5 h-5 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 rounded text-xs">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Coluna direita: Expositores + Ticker + Avisos + Sorteio */}
          <div className="space-y-4">

            {/* ── Expositores em Destaque ── */}
            <div className="bg-neutral-900 rounded-2xl p-4">
              <SectionTitle color="bg-amber-900/40 text-amber-300" icon={Star} title="Expositor Destaque" subtitle="MOD-03 · selecione quem aparece no telão" />

              {/* Ativos agora */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Em destaque agora ({spotlights.length})</p>
                  {spotlights.length > 0 && (
                    <button onClick={handleClearSpotlights} className="text-[10px] text-red-400 hover:text-red-300">Encerrar todos</button>
                  )}
                </div>
                {spotlights.length === 0 ? (
                  <p className="text-xs text-neutral-600 italic">Nenhum expositor em destaque</p>
                ) : (
                  <div className="space-y-1.5">
                    {spotlights.map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold truncate">{s.exhibitor?.name}</p>
                        <button onClick={() => handleRemoveSpotlight(s.id)} className="text-neutral-500 hover:text-red-400 ml-2 shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ranking */}
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-2">Ranking de expositores</p>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {ranking.length === 0 ? (
                    <p className="text-xs text-neutral-600 italic">Sem avaliações ainda</p>
                  ) : ranking.map((r, i) => {
                    const alreadySpot = spotlights.some(s => s.exhibitor_id === r.exhibitor_id);
                    const wasSpot = spotlightHistory.some(s => s.exhibitor_id === r.exhibitor_id);
                    return (
                      <div key={r.exhibitor_id} className="flex items-center gap-2 py-1.5 px-2 hover:bg-neutral-800 rounded-lg group">
                        <span className="text-[10px] text-neutral-600 w-4 text-center">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{r.name}</p>
                          <p className="text-[10px] text-neutral-500">
                            {r.total_avaliacoes} aval. total · {r.avaliacoes_ultima_hora} última hora
                          </p>
                        </div>
                        {wasSpot && !alreadySpot && (
                          <span className="text-[9px] text-neutral-600 shrink-0">já foi</span>
                        )}
                        <button
                          onClick={() => handleAddSpotlight(r.exhibitor_id)}
                          disabled={alreadySpot}
                          className={cn(
                            'shrink-0 text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors',
                            alreadySpot
                              ? 'bg-amber-900/30 text-amber-600 cursor-default'
                              : 'bg-neutral-700 hover:bg-amber-600 text-neutral-300 hover:text-white opacity-0 group-hover:opacity-100'
                          )}
                        >
                          {alreadySpot ? '✓' : 'Destacar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Histórico */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="mt-3 text-[10px] text-neutral-600 hover:text-neutral-400 flex items-center gap-1"
              >
                {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Histórico de destaques ({spotlightHistory.length})
              </button>
              {showHistory && spotlightHistory.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {spotlightHistory.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-2 py-1 text-neutral-600">
                      <p className="text-[10px] truncate">{s.exhibitor?.name}</p>
                      <p className="text-[10px] shrink-0 ml-2">
                        {new Date(s.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Ticker ── */}
            <div className="bg-neutral-900 rounded-2xl p-4">
              <SectionTitle color="bg-emerald-900/40 text-emerald-300" icon={Zap} title="Ticker (Rodapé)" subtitle="Configure o que aparece na barra inferior" />
              <div className="space-y-3">
                {[
                  { key: 'ticker_show_raffle',   label: 'Próximo sorteio' },
                  { key: 'ticker_show_alerts',    label: 'Avisos em aberto' },
                  { key: 'ticker_show_products',  label: 'Produtos de expositores' },
                  { key: 'ticker_show_no_photo',  label: 'Incluir produtos sem foto' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-neutral-300">{label}</span>
                    <Toggle
                      value={Boolean(cfg[key as keyof typeof DEFAULT_CONFIG])}
                      onChange={() => save({ [key]: !cfg[key as keyof typeof DEFAULT_CONFIG] })}
                    />
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-neutral-300">Velocidade</span>
                  <input
                    type="range"
                    min={20}
                    max={120}
                    value={cfg.ticker_speed}
                    onChange={(e) => save({ ticker_speed: Number(e.target.value) })}
                    className="w-28 accent-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* ── Avisos ── */}
            <div className="bg-neutral-900 rounded-2xl p-4">
              <SectionTitle color="bg-rose-900/40 text-rose-300" icon={Megaphone} title="Avisos" subtitle="Dispare avisos no telão em tempo real" />
              {announcements.length === 0 ? (
                <p className="text-xs text-neutral-600 italic">Nenhum aviso cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {announcements.filter(a => a.target_tv).map(a => {
                    const isActive = event.active_announcement_id === a.id;
                    return (
                      <div key={a.id} className={cn(
                        'rounded-xl border px-3 py-2.5 flex items-center gap-3',
                        isActive ? 'border-rose-500/40 bg-rose-900/20' : 'border-neutral-800 bg-neutral-800/40'
                      )}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{a.title}</p>
                          {a.message && <p className="text-[10px] text-neutral-500 truncate">{a.message}</p>}
                        </div>
                        <button
                          onClick={() => handleTriggerAnnouncement(isActive ? null : a.id)}
                          className={cn(
                            'shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                            isActive
                              ? 'bg-rose-500 hover:bg-rose-400 text-white'
                              : 'bg-neutral-700 hover:bg-rose-600 text-neutral-300 hover:text-white'
                          )}
                        >
                          {isActive ? 'Encerrar' : 'Disparar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {event.active_announcement_id && (
                <button
                  onClick={() => handleTriggerAnnouncement(null)}
                  className="mt-3 w-full py-2 border border-neutral-700 hover:border-neutral-500 rounded-xl text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Limpar aviso ativo do telão
                </button>
              )}
            </div>

            {/* ── Sorteio ── */}
            <div className="bg-neutral-900 rounded-2xl p-4">
              <SectionTitle color="bg-violet-900/40 text-violet-300" icon={Trophy} title="Sorteio" subtitle={`${ticketCount} participantes inscritos`} />

              {/* Estado atual */}
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl border mb-3',
                tvState === 'idle' ? 'border-neutral-800 bg-neutral-800/40' :
                tvState === 'showing_prize' ? 'border-blue-500/30 bg-blue-900/20' :
                'border-green-500/30 bg-green-900/20'
              )}>
                <Ticket className={cn('w-4 h-4 shrink-0',
                  tvState === 'idle' ? 'text-neutral-600' :
                  tvState === 'showing_prize' ? 'text-blue-400' : 'text-green-400'
                )} />
                <p className="text-xs">
                  {tvState === 'idle' && 'Telão sem sorteio ativo'}
                  {tvState === 'showing_prize' && 'Exibindo prêmio no telão...'}
                  {tvState === 'showing_winner' && 'Exibindo vencedor no telão!'}
                </p>
                {tvState !== 'idle' && (
                  <button onClick={handleCloseRaffle} className="ml-auto text-[10px] text-neutral-500 hover:text-red-400">
                    Encerrar
                  </button>
                )}
              </div>

              {/* Lista de prêmios */}
              {prizes.length === 0 ? (
                <p className="text-xs text-neutral-600 italic">Nenhum prêmio cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {prizes.map(p => {
                    const isActive = event.tv_raffle_prize_id === p.id;
                    return (
                      <div key={p.id} className={cn(
                        'rounded-xl border px-3 py-2.5',
                        isActive ? 'border-violet-500/40 bg-violet-900/20' : 'border-neutral-800 bg-neutral-800/40'
                      )}>
                        <div className="flex items-center gap-2 mb-2">
                          {p.image_url && <img src={p.image_url} className="w-8 h-8 rounded-lg object-cover" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{p.name}</p>
                            {p.winner_ticket_id && <p className="text-[10px] text-green-400">Sorteado ✓</p>}
                          </div>
                        </div>
                        {!p.winner_ticket_id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleShowPrize(p)}
                              disabled={isActive && tvState === 'showing_prize'}
                              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              {isActive && tvState === 'showing_prize' ? 'No ar' : 'Exibir'}
                            </button>
                            <button
                              onClick={() => handleDraw(p)}
                              disabled={!!drawing || ticketCount === 0}
                              className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                            >
                              {drawing === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              Sortear
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Tab: Curadoria ── */}
      {tab === 'curadoria' && (
        <div className="p-4 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold">Curadoria de Fotos</p>
              <p className="text-xs text-neutral-500">{pendingPhotos.length} fotos aguardando aprovação</p>
            </div>
            <a
              href={`/moderation/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-400 hover:text-white border border-neutral-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Abrir painel completo ↗
            </a>
          </div>

          {loadingPhotos ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {photos
                .filter(p => p.status === 'pending')
                .map(photo => (
                  <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-neutral-800 aspect-square">
                    <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleApprove(photo.id)}
                        className="w-10 h-10 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(photo.id)}
                        className="w-10 h-10 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 block" />
                    </div>
                  </div>
                ))}
              {pendingPhotos.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-neutral-600">
                  <Eye className="w-8 h-8 mb-2" />
                  <p className="text-sm">Nenhuma foto pendente</p>
                </div>
              )}
            </div>
          )}

          {/* Aprovadas recentes */}
          {photos.filter(p => p.status === 'approved').length > 0 && (
            <div className="mt-8">
              <p className="text-xs text-neutral-500 uppercase tracking-wide mb-3">Aprovadas ({photos.filter(p => p.status === 'approved').length})</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {photos
                  .filter(p => p.status === 'approved')
                  .slice(0, 40)
                  .map(photo => (
                    <div key={photo.id} className="relative group rounded-lg overflow-hidden bg-neutral-800 aspect-square">
                      <img src={photo.image_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      <button
                        onClick={() => handleReject(photo.id)}
                        className="absolute inset-0 items-center justify-center hidden group-hover:flex bg-black/40"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
