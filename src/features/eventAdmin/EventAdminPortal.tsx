import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Eye, LayoutDashboard, ShieldCheck, Printer, Store, Star, Play, Pause, CheckCircle2,
  ChevronDown, Palette, Save, X as CloseIcon, FileClock, Info, Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { AppHeader } from '../../components/AppHeader';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import type { AuditLog, EventData } from '../../types';
import { getEventById, getEventBySlug, updateEvent } from '../../services/eventService';
import { diffObjects, getEventAuditLogs, logChange } from '../../services/auditService';
import { getEventDashboard, type DashboardData } from '../../services/dashboardService';
import { HBarChart, PieChart } from './components/DashboardCharts';

// ─── Helpers de UI ─────────────────────────────────────────────────────────────

function AccordionSection({
  id, title, icon, openId, onToggle, children,
}: {
  id: string;
  title: string;
  icon?: ReactNode;
  openId: string | null;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  const isOpen = openId === id;
  return (
    <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-neutral-800">
          {icon}{title}
        </span>
        <ChevronDown className={cn('w-5 h-5 text-neutral-400 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
      {isOpen && <div className="px-5 pb-5 pt-1 border-t border-neutral-100">{children}</div>}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn('w-12 h-6 rounded-full transition-all relative shrink-0', value ? 'bg-green-500' : 'bg-neutral-300')}
    >
      <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-all', value ? 'right-1' : 'left-1')} />
    </button>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2 tracking-wider">{children}</label>;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4">
      <p className="text-xl font-black text-neutral-900 tabular-nums">{value}</p>
      <p className="text-[10px] font-bold uppercase text-neutral-400 mt-1 tracking-wider leading-tight">{label}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-neutral-100 rounded-2xl p-4">
      <p className="text-[11px] font-bold text-neutral-700 mb-3">{title}</p>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs" />
      </div>
    </div>
  );
}

// Campos do evento editáveis pela tela (usados para o form e para o diff de auditoria)
type EventForm = Pick<EventData,
  | 'name' | 'date' | 'owner_text' | 'post_event_message'
  | 'logo_url' | 'primary_color' | 'secondary_color'
  | 'bg_type' | 'bg_value' | 'bg_gradient_from' | 'bg_gradient_to' | 'bg_pattern_bg' | 'bg_pattern_fg'
  | 'tv_bg_type' | 'tv_bg_value' | 'tv_primary_color' | 'tv_secondary_color'
  | 'app_logo'
  | 'comment_moderation_enabled' | 'custom_comments' | 'upload_source' | 'has_official_photos'
  | 'exhibitor_categories' | 'exhibitors_estimation'
  | 'public_evaluation_weight' | 'juror_evaluation_weight'
>;

function buildForm(e: EventData): EventForm {
  return {
    name: e.name || '',
    date: e.date || '',
    owner_text: e.owner_text || '',
    post_event_message: e.post_event_message || '',
    logo_url: e.logo_url || '',
    primary_color: e.primary_color || '#000000',
    secondary_color: e.secondary_color || '#ffffff',
    bg_type: e.bg_type || 'color',
    bg_value: e.bg_value || '#f5f5f5',
    bg_gradient_from: e.bg_gradient_from || '#f5f7fa',
    bg_gradient_to: e.bg_gradient_to || '#c3cfe2',
    bg_pattern_bg: e.bg_pattern_bg || '#f5f5f5',
    bg_pattern_fg: e.bg_pattern_fg || '#e5e5e5',
    tv_bg_type: e.tv_bg_type || 'color',
    tv_bg_value: e.tv_bg_value || '#0a0a0a',
    tv_primary_color: e.tv_primary_color || '#ffffff',
    tv_secondary_color: e.tv_secondary_color || '#000000',
    app_logo: e.app_logo || '',
    comment_moderation_enabled: e.comment_moderation_enabled ?? true,
    custom_comments: e.custom_comments || [],
    upload_source: e.upload_source || 'both',
    has_official_photos: e.has_official_photos || false,
    exhibitor_categories: e.exhibitor_categories || [],
    exhibitors_estimation: e.exhibitors_estimation ?? 0,
    public_evaluation_weight: e.public_evaluation_weight ?? 0.40,
    juror_evaluation_weight: e.juror_evaluation_weight ?? 0.60,
  };
}

const TABS = [
  { id: 'dados',      label: 'Dados do Evento' },
  { id: 'aparencia',  label: 'Aparência' },
  { id: 'config',     label: 'Configurações' },
  { id: 'avaliacao',  label: 'Config. Avaliação' },
  { id: 'sorteio',    label: 'Config. Sorteio' },
  { id: 'relatorios', label: 'Relatórios' },
  { id: 'marketing',  label: 'Marketing' },
  { id: 'auditoria',  label: 'Auditoria' },
] as const;

type TabId = typeof TABS[number]['id'];

const ACTION_LABELS: Record<string, string> = {
  update_event: 'Edição de dados',
  update_status: 'Mudança de fase',
};

// ─── Componente principal ────────────────────────────────────────────────────

export default function EventAdminPortal() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EventForm | null>(null);
  const [openSection, setOpenSection] = useState<string | null>('config');
  const [activeTab, setActiveTab] = useState<TabId>('dados');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const set = <K extends keyof EventForm>(key: K, value: EventForm[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  // Acesso: admin geral e admin do evento
  const canAccess = !!user && (user.role === 'admin' || user.role === 'event_admin');

  useEffect(() => {
    if (!authLoading && !canAccess) navigate('/login', { replace: true });
  }, [authLoading, canAccess, navigate]);

  // Carrega o evento: por slug (admin geral) ou pelo event_id do usuário (event_admin)
  useEffect(() => {
    if (!user || !canAccess) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const data = slug
          ? await getEventBySlug(slug)
          : user.event_id
            ? await getEventById(user.event_id)
            : null;
        if (!active) return;
        setEvent(data);
        if (data) setForm(buildForm(data));
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar o evento.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user, canAccess, slug]);

  const loadAudit = useCallback(async (eventId: string) => {
    try {
      setAuditLogs(await getEventAuditLogs(eventId));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (event && activeTab === 'auditoria') loadAudit(event.id);
  }, [event, activeTab, loadAudit]);

  // Carrega métricas do dashboard ao abrir a seção (recarrega quando o evento muda)
  useEffect(() => {
    if (!event || openSection !== 'dashboard') return;
    let active = true;
    setDashboardLoading(true);
    getEventDashboard(event)
      .then(d => { if (active) setDashboard(d); })
      .catch(err => { console.error(err); if (active) toast.error('Erro ao carregar métricas.'); })
      .finally(() => { if (active) setDashboardLoading(false); });
    return () => { active = false; };
  }, [event, openSection]);

  const toggleSection = (id: string) => setOpenSection((s) => (s === id ? null : id));

  const handleStatus = async (status: 'pre' | 'live' | 'post') => {
    if (!event || event.status === status) return;
    try {
      await updateEvent(event.id, { status });
      await logChange({
        eventId: event.id,
        user,
        action: 'update_status',
        changes: { status: { before: event.status, after: status } },
      });
      setEvent({ ...event, status });
      toast.success(`Fase alterada para ${status.toUpperCase()}.`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao alterar a fase do evento.');
    }
  };

  const handleSave = async () => {
    if (!event || !form) return;
    const weightSum = (form.public_evaluation_weight ?? 0) + (form.juror_evaluation_weight ?? 0);
    if (weightSum > 1) {
      toast.error('A soma dos pesos de avaliação não pode ser maior que 1.');
      return;
    }
    const changes = diffObjects(
      event as unknown as Record<string, unknown>,
      form as unknown as Record<string, unknown>,
    );
    if (Object.keys(changes).length === 0) {
      toast.info('Nenhuma alteração para salvar.');
      return;
    }
    setSaving(true);
    try {
      await updateEvent(event.id, form);
      await logChange({ eventId: event.id, user, action: 'update_event', changes });
      setEvent({ ...event, ...form });
      toast.success('Alterações salvas.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (!event || !form) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AppHeader title="Administração do Evento" />
        <main className="max-w-3xl mx-auto p-6">
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center space-y-2">
            <p className="text-sm font-bold text-neutral-900">Evento não encontrado</p>
            <p className="text-xs text-neutral-400">
              {user.role === 'event_admin'
                ? 'Seu usuário não está vinculado a nenhum evento. Contate o administrador geral.'
                : 'Não foi possível localizar este evento.'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const accessButtons = [
    { label: 'App', icon: Eye, path: `/event/${event.slug}`, color: 'text-neutral-600 bg-neutral-50 border-neutral-100 hover:bg-neutral-100' },
    { label: 'TV', icon: LayoutDashboard, path: `/tv/${event.slug}`, color: 'text-neutral-600 bg-neutral-50 border-neutral-100 hover:bg-neutral-100' },
    { label: 'Curadoria', icon: ShieldCheck, path: `/moderation/${event.slug}`, color: 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100' },
    { label: 'Operador', icon: Printer, path: `/operator/${event.slug}`, color: 'text-violet-600 bg-violet-50 border-violet-100 hover:bg-violet-100' },
    { label: 'Expositores', icon: Store, path: `/expositores/${event.slug}`, color: 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100' },
    { label: 'Parceiros', icon: Star, path: `/parceiros/${event.slug}`, color: 'text-yellow-600 bg-yellow-50 border-yellow-100 hover:bg-yellow-100' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader title={`Administração — ${event.name}`} />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">

        {/* ── SEÇÃO 1 (FIXA): Controles da Feira ── */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-black text-neutral-900 truncate">{event.name}</h2>
              <p className="text-[11px] text-neutral-400 font-medium">/{event.slug}</p>
            </div>

            {/* Fases */}
            <div className="flex gap-2">
              {([
                { s: 'pre' as const, label: 'PRÉ', icon: Pause, on: 'bg-blue-600 text-white' },
                { s: 'live' as const, label: 'LIVE', icon: Play, on: 'bg-red-600 text-white' },
                { s: 'post' as const, label: 'PÓS', icon: CheckCircle2, on: 'bg-neutral-800 text-white' },
              ]).map(({ s, label, icon: Icon, on }) => (
                <button
                  key={s}
                  onClick={() => handleStatus(s)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors',
                    event.status === s ? on : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-neutral-100',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Acessos rápidos */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
            {accessButtons.map(({ label, icon: Icon, path, color }) => (
              <button
                key={label}
                onClick={() => window.open(path, '_blank')}
                className={cn('py-3 border rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 transition-colors', color)}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── SEÇÃO 2 (ACORDEON): Dashboard ── */}
        <AccordionSection id="dashboard" title="Dashboard" icon={<LayoutDashboard className="w-4 h-4 text-neutral-400" />} openId={openSection} onToggle={toggleSection}>
          {dashboardLoading || !dashboard ? (
            <div className="flex justify-center py-10 pt-6">
              <div className="w-6 h-6 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="pt-4 space-y-6">
              {/* ── Métricas Gerais ── */}
              <div>
                <h3 className="text-xs font-black uppercase text-neutral-500 tracking-wider mb-3">Métricas Gerais</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <MetricCard label="Expositores (previstos vs cadastrados)" value={`${dashboard.cadastrados} / ${dashboard.previstos}`} />
                  <MetricCard label="Média de produtos por expositor" value={dashboard.avgProductsPerExhibitor.toFixed(1)} />
                  <MetricCard label="Média de valor por produto" value={dashboard.avgProductValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                  <MetricCard label="Completos / Incompletos / Previstos" value={`${dashboard.completos} / ${dashboard.incompletos} / ${dashboard.previstos}`} />
                  <MetricCard label="Visitas Pré (únicos vs total)" value={`${dashboard.visitsPre.unique} / ${dashboard.visitsPre.total}`} />
                  <MetricCard label="Visitas Live (únicos vs total)" value={`${dashboard.visitsLive.unique} / ${dashboard.visitsLive.total}`} />
                  <MetricCard label="Visitas Pós (únicos vs total)" value={`${dashboard.visitsPost.unique} / ${dashboard.visitsPost.total}`} />
                </div>
              </div>

              {/* ── Visitas ── */}
              <div>
                <h3 className="text-xs font-black uppercase text-neutral-500 tracking-wider mb-3">Visitas</h3>
                <div className="grid lg:grid-cols-2 gap-5">
                  <ChartCard title="Top 10 Expositores — mais visitas">
                    <HBarChart data={dashboard.topExhibitors} color="#16a34a" />
                  </ChartCard>
                  <ChartCard title="Top 10 Expositores — menos visitas">
                    <HBarChart data={dashboard.bottomExhibitors} color="#dc2626" />
                  </ChartCard>
                  <ChartCard title="Top 10 Produtos — mais visitas">
                    <HBarChart data={dashboard.topProducts} color="#16a34a" />
                  </ChartCard>
                  <ChartCard title="Top 10 Produtos — menos visitas">
                    <HBarChart data={dashboard.bottomProducts} color="#dc2626" />
                  </ChartCard>
                  <ChartCard title="Visitantes únicos por categoria">
                    <PieChart data={dashboard.uniqueByCategory} />
                  </ChartCard>
                </div>
              </div>
            </div>
          )}
        </AccordionSection>

        {/* ── SEÇÃO 3 (ACORDEON): Configurações do Evento (abas) ── */}
        <AccordionSection id="config" title="Configurações do Evento" icon={<Palette className="w-4 h-4 text-neutral-400" />} openId={openSection} onToggle={toggleSection}>
          {/* Abas */}
          <div className="flex gap-1 overflow-x-auto border-b border-neutral-100 mt-4 -mx-1 px-1">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'px-3.5 py-2.5 text-[11px] font-bold whitespace-nowrap border-b-2 transition-all',
                  activeTab === id ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-700',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="pt-5">
            {/* Aba 1 — Dados do Evento */}
            {activeTab === 'dados' && (
              <div className="grid lg:grid-cols-2 gap-5">
                <div>
                  <Label>Nome do Evento</Label>
                  <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <Label>Data do Evento</Label>
                  <input
                    type="datetime-local"
                    value={typeof form.date === 'string' ? form.date.slice(0, 16) : ''}
                    onChange={(e) => set('date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label>Sobre o Evento</Label>
                  <textarea value={form.owner_text} onChange={(e) => set('owner_text', e.target.value)} rows={4} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none" />
                </div>
                <div className="lg:col-span-2">
                  <Label>Mensagem Pós-Evento</Label>
                  <textarea value={form.post_event_message} onChange={(e) => set('post_event_message', e.target.value)} rows={3} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none" />
                </div>
              </div>
            )}

            {/* Aba 2 — Aparência */}
            {activeTab === 'aparencia' && (
              <div className="space-y-5">
                <div className="grid lg:grid-cols-2 gap-5">
                  <div>
                    <Label>Logo do Cliente (URL)</Label>
                    <input type="text" value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} placeholder="https://exemplo.com/logo.png" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <Label>Logo do App (URL)</Label>
                    <input type="text" value={form.app_logo} onChange={(e) => set('app_logo', e.target.value)} placeholder="https://exemplo.com/app-logo.png" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <ColorField label="Cor Primária" value={form.primary_color!} onChange={(v) => set('primary_color', v)} />
                  <ColorField label="Cor Secundária" value={form.secondary_color!} onChange={(v) => set('secondary_color', v)} />
                </div>

                {/* Fundo do App */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-3">
                  <Label>Plano de Fundo (App)</Label>
                  <div className="flex gap-2">
                    {(['color', 'gradient', 'pattern'] as const).map((t) => (
                      <button key={t} type="button" onClick={() => set('bg_type', t)} className={cn('flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all', form.bg_type === t ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 border border-neutral-200')}>
                        {t === 'color' ? 'Cor' : t === 'gradient' ? 'Degradê' : 'Padrão'}
                      </button>
                    ))}
                  </div>
                  {form.bg_type === 'color' && (
                    <ColorField label="Cor de Fundo" value={form.bg_value!} onChange={(v) => set('bg_value', v)} />
                  )}
                  {form.bg_type === 'gradient' && (
                    <div className="grid grid-cols-2 gap-3">
                      <ColorField label="De" value={form.bg_gradient_from!} onChange={(v) => set('bg_gradient_from', v)} />
                      <ColorField label="Para" value={form.bg_gradient_to!} onChange={(v) => set('bg_gradient_to', v)} />
                    </div>
                  )}
                  {form.bg_type === 'pattern' && (
                    <div className="grid grid-cols-2 gap-3">
                      <ColorField label="Cor Fundo" value={form.bg_pattern_bg!} onChange={(v) => set('bg_pattern_bg', v)} />
                      <ColorField label="Cor Padrão" value={form.bg_pattern_fg!} onChange={(v) => set('bg_pattern_fg', v)} />
                    </div>
                  )}
                </div>

                {/* TV */}
                <div className="p-4 bg-neutral-900 rounded-2xl space-y-3 text-white">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Personalização da TV</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-500 mb-1">Cor Primária TV</label>
                      <input type="color" value={form.tv_primary_color} onChange={(e) => set('tv_primary_color', e.target.value)} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-500 mb-1">Cor Secundária TV</label>
                      <input type="color" value={form.tv_secondary_color} onChange={(e) => set('tv_secondary_color', e.target.value)} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-bold uppercase text-neutral-500">Fundo da TV</label>
                    <div className="flex gap-2">
                      {(['color', 'gradient', 'pattern'] as const).map((t) => (
                        <button key={t} type="button" onClick={() => set('tv_bg_type', t)} className={cn('flex-1 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all', form.tv_bg_type === t ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-neutral-400 border border-white/5')}>
                          {t === 'color' ? 'Cor' : t === 'gradient' ? 'Degradê' : 'Padrão'}
                        </button>
                      ))}
                    </div>
                    <input type="color" value={form.tv_bg_value} onChange={(e) => set('tv_bg_value', e.target.value)} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {/* Aba 3 — Configurações */}
            {activeTab === 'config' && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div>
                    <p className="text-xs font-bold">Moderação de Comentários</p>
                    <p className="text-[10px] text-neutral-400">Exigir aprovação manual</p>
                  </div>
                  <Toggle value={form.comment_moderation_enabled!} onChange={() => set('comment_moderation_enabled', !form.comment_moderation_enabled)} />
                </div>
                <div>
                  <Label>Comentários Padrão (separados por vírgula)</Label>
                  <input
                    type="text"
                    value={Array.isArray(form.custom_comments) ? form.custom_comments.join(', ') : ''}
                    onChange={(e) => set('custom_comments', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    placeholder="Lindo!, Adorei, Que momento!"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <Label>Categorias de Expositor (separadas por vírgula)</Label>
                  <input
                    type="text"
                    value={Array.isArray(form.exhibitor_categories) ? form.exhibitor_categories.join(', ') : ''}
                    onChange={(e) => set('exhibitor_categories', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    placeholder="Salgados, Doces, Artesanato, Outros"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Usadas no combobox de categoria do cadastro de expositores.</p>
                </div>
                <div>
                  <Label>Expositores Previstos</Label>
                  <input
                    type="number" min="0" step="1"
                    value={form.exhibitors_estimation ?? 0}
                    onChange={(e) => set('exhibitors_estimation', Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Peso Avaliação Visitantes</Label>
                    <input
                      type="number" min="0" max="1" step="0.01"
                      value={form.public_evaluation_weight ?? 0}
                      onChange={(e) => set('public_evaluation_weight', Number(e.target.value) || 0)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <Label>Peso Avaliação Jurados</Label>
                    <input
                      type="number" min="0" max="1" step="0.01"
                      value={form.juror_evaluation_weight ?? 0}
                      onChange={(e) => set('juror_evaluation_weight', Number(e.target.value) || 0)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  {(() => {
                    const sum = (form.public_evaluation_weight ?? 0) + (form.juror_evaluation_weight ?? 0);
                    return (
                      <p className={cn('col-span-2 text-[10px] mt-1', sum > 1 ? 'text-red-500 font-bold' : 'text-neutral-400')}>
                        Soma dos pesos: {sum.toFixed(2)} {sum > 1 ? '— não pode ultrapassar 1.00' : '(máx. 1.00)'}
                      </p>
                    );
                  })()}
                </div>
                <div>
                  <Label>Origem de Upload (Live)</Label>
                  <select value={form.upload_source} onChange={(e) => set('upload_source', e.target.value as 'camera' | 'gallery' | 'both')} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm">
                    <option value="both">Câmera e Galeria</option>
                    <option value="camera">Apenas Câmera</option>
                    <option value="gallery">Apenas Galeria</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div>
                    <p className="text-xs font-bold">Fotos Oficiais</p>
                    <p className="text-[10px] text-neutral-400">Habilitar seção de fotos da equipe</p>
                  </div>
                  <Toggle value={form.has_official_photos!} onChange={() => set('has_official_photos', !form.has_official_photos)} />
                </div>
              </div>
            )}

            {/* Abas 4–7 — placeholders */}
            {(['avaliacao', 'sorteio', 'relatorios', 'marketing'] as const).includes(activeTab as any) && (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
                <Info className="w-10 h-10 mb-3" />
                <p className="text-sm font-bold text-neutral-400">Em definição</p>
                <p className="text-xs mt-1">Esta seção será implementada em breve.</p>
              </div>
            )}

            {/* Aba 8 — Auditoria */}
            {activeTab === 'auditoria' && (
              <div>
                {auditLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
                    <FileClock className="w-10 h-10 mb-3" />
                    <p className="text-sm font-bold text-neutral-400">Nenhuma alteração registrada</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-neutral-100 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 text-[10px] uppercase text-neutral-400 font-bold tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Data/Hora</th>
                          <th className="px-4 py-3">Autor</th>
                          <th className="px-4 py-3">Ação</th>
                          <th className="px-4 py-3 text-right">Detalhes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-neutral-50">
                            <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                              {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </td>
                            <td className="px-4 py-3 text-neutral-700 font-medium">
                              {log.user_name || log.user_email || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold">
                                {ACTION_LABELS[log.action] || log.action}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => setSelectedLog(log)} className="text-[11px] font-bold text-blue-600 hover:underline">
                                Detalhes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botão salvar (abas editáveis) */}
          {(['dados', 'aparencia', 'config'] as const).includes(activeTab as any) && (
            <div className="flex justify-end pt-5 mt-4 border-t border-neutral-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Alterações
              </button>
            </div>
          )}
        </AccordionSection>
      </main>

      {/* Modal de detalhes da auditoria */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Detalhes da Alteração</h3>
              <button onClick={() => setSelectedLog(null)}><CloseIcon className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <div className="space-y-1 text-xs text-neutral-500 mb-4">
              <p><strong className="text-neutral-700">Autor:</strong> {selectedLog.user_name || selectedLog.user_email || '—'}</p>
              <p><strong className="text-neutral-700">Quando:</strong> {format(new Date(selectedLog.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</p>
              <p><strong className="text-neutral-700">Ação:</strong> {ACTION_LABELS[selectedLog.action] || selectedLog.action}</p>
            </div>
            <div className="space-y-3">
              {Object.entries(selectedLog.changes).map(([field, change]) => (
                <div key={field} className="border border-neutral-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase text-neutral-400 mb-2 tracking-wider">{field}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-50 rounded-lg p-2">
                      <p className="text-[9px] font-bold uppercase text-red-400 mb-1">Antes</p>
                      <p className="text-red-700 break-words">{formatValue(change.before)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-[9px] font-bold uppercase text-green-500 mb-1">Depois</p>
                      <p className="text-green-700 break-words">{formatValue(change.after)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '(vazio)';
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '(vazio)';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
