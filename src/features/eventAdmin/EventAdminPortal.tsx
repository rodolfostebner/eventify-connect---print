import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Eye, LayoutDashboard, ShieldCheck, Printer, Store, Star, Play, Pause, CheckCircle2,
  ChevronDown, Palette, Save, X as CloseIcon, FileClock, Info, Loader2, Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { AppHeader } from '../../components/AppHeader';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import type { AuditLog, EventData, EvaluationCategory, UserEmailRole, Announcement } from '../../types';
import { getEventById, getEventBySlug, updateEvent } from '../../services/eventService';
import { diffObjects, getEventAuditLogs, logChange } from '../../services/auditService';
import { getEventDashboard, type DashboardData } from '../../services/dashboardService';
import { HBarChart, PieChart } from './components/DashboardCharts';
import {
  getEvaluationCategories, createEvaluationCategory, updateEvaluationCategory, deleteEvaluationCategory,
} from '../../services/evaluationService';
import {
  listAvaliadores, addEmailRole, removeEmailRole, listEmailRoles, updateUserRole, updateUserDisplayName,
} from '../../services/userService';
import type { ExhibitorLinkedUser } from '../../services/userService';

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
  { id: 'avisos',     label: 'Avisos' },
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

// ─── Categorias de Avaliação ──────────────────────────────────────────────────

function CategoriasAvaliacaoSection({ eventId }: { eventId: string }) {
  const [categories, setCategories] = useState<EvaluationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({ name: '', weight: '1' });
  const [editForm, setEditForm] = useState({ name: '', weight: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setCategories(await getEvaluationCategories(eventId)); }
    catch { toast.error('Erro ao carregar categorias'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [eventId]);

  const totalWeight = categories.reduce((s, c) => s + c.weight, 0);

  const handleAdd = async () => {
    const w = parseFloat(newForm.weight);
    if (!newForm.name.trim() || !w || w <= 0) return;
    setSaving(true);
    try {
      await createEvaluationCategory({
        event_id: eventId, name: newForm.name.trim(), weight: w, order_index: categories.length + 1,
      });
      setNewForm({ name: '', weight: '1' }); setAdding(false);
      toast.success('Categoria criada'); load();
    } catch { toast.error('Erro ao criar categoria'); }
    finally { setSaving(false); }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const w = parseFloat(editForm.weight);
    if (!editForm.name.trim() || !w || w <= 0) return;
    setSaving(true);
    try {
      await updateEvaluationCategory(editingId, { name: editForm.name.trim(), weight: w });
      setEditingId(null); toast.success('Categoria atualizada'); load();
    } catch { toast.error('Erro ao atualizar categoria'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (cat: EvaluationCategory) => {
    if (!confirm(`Remover a categoria "${cat.name}"?`)) return;
    try {
      await deleteEvaluationCategory(cat.id);
      setCategories(cs => cs.filter(c => c.id !== cat.id));
      toast.success('Categoria removida');
    } catch { toast.error('Erro ao remover categoria'); }
  };

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-800">Categorias de Avaliação</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">Critérios usados pelos avaliadores. O peso define a influência relativa de cada categoria no ranking.</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        )}
      </div>

      {adding && (
        <div className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-neutral-50">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Nova categoria</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nome da categoria (ex: Inovação)"
              value={newForm.name}
              onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            <input
              type="number" min="0.1" step="0.1"
              placeholder="Peso"
              value={newForm.weight}
              onChange={e => setNewForm(f => ({ ...f, weight: e.target.value }))}
              className="w-24 px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white text-right focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !newForm.name.trim()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors">
              {saving ? 'Salvando...' : 'Adicionar'}
            </button>
            <button onClick={() => { setAdding(false); setNewForm({ name: '', weight: '1' }); }} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 && !adding && (
        <div className="text-center py-8 text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
          <p className="text-sm">Nenhuma categoria cadastrada</p>
          <p className="text-xs mt-1">Adicione categorias para que os avaliadores possam pontuar os expositores.</p>
        </div>
      )}

      {categories.length > 0 && (
        <div className="border border-neutral-100 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-[10px] uppercase text-neutral-400 font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right w-20">Peso</th>
                <th className="px-4 py-3 text-right w-16">%</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-neutral-50">
                  {editingId === cat.id ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none"
                          onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                          autoFocus
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number" min="0.1" step="0.1"
                          value={editForm.weight}
                          onChange={e => setEditForm(f => ({ ...f, weight: e.target.value }))}
                          className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white text-right focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-300 tabular-nums">—</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={handleSaveEdit} disabled={saving} className="text-[11px] font-bold text-neutral-900 hover:underline disabled:opacity-50">Salvar</button>
                          <button onClick={() => setEditingId(null)} className="text-[11px] font-bold text-neutral-400 hover:underline">Cancelar</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-neutral-900">{cat.name}</td>
                      <td className="px-4 py-3 text-right text-neutral-600 tabular-nums">{cat.weight}</td>
                      <td className="px-4 py-3 text-right text-neutral-400 tabular-nums">
                        {totalWeight > 0 ? Math.round((cat.weight / totalWeight) * 100) : 0}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => { setEditingId(cat.id); setEditForm({ name: cat.name, weight: String(cat.weight) }); }} className="text-[11px] font-bold text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => handleDelete(cat)} className="text-[11px] font-bold text-red-500 hover:underline">Remover</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Avaliadores ──────────────────────────────────────────────────────────────

function AvaliadorSection({ eventId }: { eventId: string }) {
  const [linked, setLinked] = useState<ExhibitorLinkedUser[]>([]);
  const [pending, setPending] = useState<UserEmailRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [editingActiveId, setEditingActiveId] = useState<string | null>(null);
  const [editingPendingEmail, setEditingPendingEmail] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [linkedData, allPending] = await Promise.all([listAvaliadores(eventId), listEmailRoles()]);
      setLinked(linkedData);
      setPending(allPending.filter(r => r.role === 'avaliador' && r.event_id === eventId));
    } catch { toast.error('Erro ao carregar avaliadores'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [eventId]);

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    setSaving(true);
    try {
      await addEmailRole({ email: newEmail.trim().toLowerCase(), role: 'avaliador', event_id: eventId, exhibitor_id: null });
      toast.success('Avaliador cadastrado — poderá entrar com Google ou link mágico.');
      setNewEmail(''); setAdding(false); load();
    } catch { toast.error('Erro ao cadastrar avaliador'); }
    finally { setSaving(false); }
  };

  const handleSaveActiveName = async () => {
    if (!editingActiveId || !editName.trim()) return;
    setSaving(true);
    try {
      await updateUserDisplayName(editingActiveId, editName.trim());
      setEditingActiveId(null); toast.success('Nome atualizado'); load();
    } catch { toast.error('Erro ao atualizar nome'); }
    finally { setSaving(false); }
  };

  const handleSavePendingEmail = async (oldEmail: string) => {
    const next = editEmail.trim().toLowerCase();
    if (!next || next === oldEmail) { setEditingPendingEmail(null); return; }
    setSaving(true);
    try {
      await removeEmailRole(oldEmail);
      await addEmailRole({ email: next, role: 'avaliador', event_id: eventId, exhibitor_id: null });
      setEditingPendingEmail(null); setEditEmail('');
      toast.success('E-mail atualizado'); load();
    } catch { toast.error('Erro ao atualizar e-mail'); }
    finally { setSaving(false); }
  };

  const handleRemoveLinked = async (user: ExhibitorLinkedUser) => {
    if (!confirm(`Remover acesso de ${user.email} como avaliador?`)) return;
    try {
      await updateUserRole(user.id, 'participant', null, null);
      setLinked(ls => ls.filter(l => l.id !== user.id));
      toast.success('Acesso removido');
    } catch { toast.error('Erro ao remover acesso'); }
  };

  const handleRemovePending = async (email: string) => {
    if (!confirm(`Cancelar convite para ${email}?`)) return;
    try {
      await removeEmailRole(email);
      setPending(ps => ps.filter(p => p.email !== email));
      toast.success('Convite cancelado');
    } catch { toast.error('Erro ao cancelar convite'); }
  };

  const totalCount = linked.length + pending.length;

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-800">Avaliadores</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            {linked.length} ativo{linked.length !== 1 ? 's' : ''} · {pending.length} pendente{pending.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        )}
      </div>

      {adding && (
        <div className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-neutral-50">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Novo avaliador</p>
          <input
            type="email"
            placeholder="email@avaliador.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <p className="text-xs text-neutral-400">O avaliador entrará com este e-mail via Google ou link mágico e terá acesso ao painel de avaliação.</p>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !newEmail.trim()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors">
              {saving ? 'Salvando...' : 'Cadastrar'}
            </button>
            <button onClick={() => { setAdding(false); setNewEmail(''); }} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {totalCount === 0 && !adding && (
        <div className="text-center py-8 text-neutral-400 border border-dashed border-neutral-200 rounded-xl">
          <p className="text-sm">Nenhum avaliador cadastrado</p>
          <p className="text-xs mt-1">Adicione avaliadores para que possam pontuar os expositores por categoria.</p>
        </div>
      )}

      {totalCount > 0 && (
        <div className="border border-neutral-100 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-[10px] uppercase text-neutral-400 font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Nome / E-mail</th>
                <th className="px-4 py-3 text-center w-24">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {linked.map(user => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  {editingActiveId === user.id ? (
                    <>
                      <td className="px-3 py-2" colSpan={2}>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          placeholder="Nome do avaliador"
                          className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none"
                          onKeyDown={e => e.key === 'Enter' && handleSaveActiveName()}
                          autoFocus
                        />
                        <p className="text-[10px] text-neutral-400 mt-1">{user.email}</p>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={handleSaveActiveName} disabled={saving} className="text-[11px] font-bold text-neutral-900 hover:underline disabled:opacity-50">Salvar</button>
                          <button onClick={() => setEditingActiveId(null)} className="text-[11px] font-bold text-neutral-400 hover:underline">Cancelar</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-neutral-900">{user.display_name ?? user.email}</p>
                        {user.display_name && <p className="text-neutral-400">{user.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold">Ativo</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => { setEditingActiveId(user.id); setEditName(user.display_name ?? ''); }} className="text-[11px] font-bold text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => handleRemoveLinked(user)} className="text-[11px] font-bold text-red-500 hover:underline">Remover</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {pending.map(p => (
                <tr key={p.email} className="hover:bg-neutral-50">
                  {editingPendingEmail === p.email ? (
                    <>
                      <td className="px-3 py-2" colSpan={2}>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none"
                          onKeyDown={e => e.key === 'Enter' && handleSavePendingEmail(p.email)}
                          autoFocus
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleSavePendingEmail(p.email)} disabled={saving} className="text-[11px] font-bold text-neutral-900 hover:underline disabled:opacity-50">Salvar</button>
                          <button onClick={() => setEditingPendingEmail(null)} className="text-[11px] font-bold text-neutral-400 hover:underline">Cancelar</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-neutral-600">{p.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">Pendente</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => { setEditingPendingEmail(p.email); setEditEmail(p.email); }} className="text-[11px] font-bold text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => handleRemovePending(p.email)} className="text-[11px] font-bold text-red-500 hover:underline">Cancelar</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Aba de Avisos ─────────────────────────────────────────────────────────────
import {
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, triggerAnnouncement
} from '../../services/announcementService';
import { uploadAudio } from '../../services/storageService';
import { Megaphone, Bell, Tv, Smartphone, Trash2, Edit3, Sparkles, Music, Upload, Volume2 } from 'lucide-react';

function AvisosSection({ event, onEventUpdate }: { event: EventData; onEventUpdate: (ev: EventData) => void }) {
  const eventId = event.id;
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Audio uploading & preview state
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [previewingSoundId, setPreviewingSoundId] = useState<string | null>(null);
  const [activeAudioElement, setActiveAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Form State
  const [form, setForm] = useState({
    title: '',
    message: '',
    bg_color: '#ef4444',
    text_color: '#ffffff',
    icon: 'megaphone',
    show_duration_sec: 15,
    target_tv: true,
    target_app_popup: false,
    target_push: false,
    audio_url: 'synth_classic' as string | null
  });

  const load = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      setAnnouncements(await getAnnouncements(eventId));
    } catch {
      toast.error('Erro ao carregar avisos.');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    load(true);
  }, [eventId]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Preencha o título e a mensagem.');
      return;
    }
    
    if (!form.target_tv && !form.target_app_popup && !form.target_push) {
      toast.error('Selecione pelo menos um canal de destino.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateAnnouncement(editingId, form);
        toast.success('Aviso atualizado com sucesso.');
        setEditingId(null);
      } else {
        await createAnnouncement({
          event_id: eventId,
          ...form
        });
        toast.success('Aviso criado com sucesso.');
      }
      // Reset form
      setForm({
        title: '',
        message: '',
        bg_color: '#ef4444',
        text_color: '#ffffff',
        icon: 'megaphone',
        show_duration_sec: 15,
        target_tv: true,
        target_app_popup: false,
        target_push: false,
        audio_url: 'synth_classic'
      });
      load();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar o aviso.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setForm({
      title: ann.title,
      message: ann.message,
      bg_color: ann.bg_color || '#ef4444',
      text_color: ann.text_color || '#ffffff',
      icon: ann.icon || 'megaphone',
      show_duration_sec: ann.show_duration_sec || 15,
      target_tv: ann.target_tv,
      target_app_popup: ann.target_app_popup,
      target_push: ann.target_push,
      audio_url: ann.audio_url || 'synth_classic'
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este aviso?')) return;
    try {
      await deleteAnnouncement(id);
      toast.success('Aviso removido.');
      load();
    } catch {
      toast.error('Erro ao remover o aviso.');
    }
  };

  const handleTrigger = async (annId: string) => {
    try {
      await triggerAnnouncement(eventId, annId);
      toast.success('Aviso disparado em tempo real nos canais selecionados!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao disparar aviso.');
    }
  };

  const handleClear = async () => {
    try {
      await triggerAnnouncement(eventId, null);
      toast.success('Telão e Popups limpos com sucesso.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao limpar avisos.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      title: '',
      message: '',
      bg_color: '#ef4444',
      text_color: '#ffffff',
      icon: 'megaphone',
      show_duration_sec: 15,
      target_tv: true,
      target_app_popup: false,
      target_push: false,
      audio_url: 'synth_classic'
    });
  };

  const handleUploadSound = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('O tamanho máximo permitido para o áudio é 2MB.');
      return;
    }

    // Validate type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg)$/i)) {
      toast.error('Formato de arquivo inválido. Use MP3, WAV ou OGG.');
      return;
    }

    const currentSounds = event.custom_sounds || [];
    if (currentSounds.length >= 3) {
      toast.error('Você já atingiu o limite de 3 sons personalizados para este evento.');
      return;
    }

    setUploadingAudio(true);
    try {
      const publicUrl = await uploadAudio(file);
      const newSound = {
        id: `sound-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
        url: publicUrl
      };

      const updatedSounds = [...currentSounds, newSound];
      await updateEvent(event.id, { custom_sounds: updatedSounds });
      onEventUpdate({ ...event, custom_sounds: updatedSounds });
      toast.success('Som personalizado adicionado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao fazer upload do som.');
    } finally {
      setUploadingAudio(false);
      e.target.value = '';
    }
  };

  const handleDeleteSound = async (soundId: string) => {
    if (!confirm('Deseja realmente excluir este som personalizado?')) return;

    if (previewingSoundId === soundId && activeAudioElement) {
      activeAudioElement.pause();
      setPreviewingSoundId(null);
      setActiveAudioElement(null);
    }

    const currentSounds = event.custom_sounds || [];
    const updatedSounds = currentSounds.filter(s => s.id !== soundId);

    try {
      await updateEvent(event.id, { custom_sounds: updatedSounds });
      onEventUpdate({ ...event, custom_sounds: updatedSounds });
      toast.success('Som removido com sucesso.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover o som.');
    }
  };

  const handlePlayPreview = (soundId: string, url: string) => {
    if (previewingSoundId === soundId) {
      if (activeAudioElement) {
        activeAudioElement.pause();
      }
      setPreviewingSoundId(null);
      setActiveAudioElement(null);
      return;
    }

    if (activeAudioElement) {
      activeAudioElement.pause();
    }

    const audio = new Audio(url);
    audio.volume = 0.8;
    audio.play().catch(err => {
      console.error('Error playing audio preview:', err);
      toast.error('Não foi possível reproduzir este som.');
    });

    setPreviewingSoundId(soundId);
    setActiveAudioElement(audio);

    audio.onended = () => {
      setPreviewingSoundId(null);
      setActiveAudioElement(null);
    };
  };

  useEffect(() => {
    return () => {
      if (activeAudioElement) {
        activeAudioElement.pause();
      }
    };
  }, [activeAudioElement]);

  const iconsList = [
    { value: 'megaphone', label: 'Megafone' },
    { value: 'bell', label: 'Sino' },
    { value: 'info', label: 'Info' },
    { value: 'alert-triangle', label: 'Alerta' },
    { value: 'party-popper', label: 'Festa' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-800">Módulo de Avisos Multicanal</h3>
          <p className="text-[10px] text-neutral-400 mt-0.5">Cadastre, edite e dispare mensagens urgentes para TV, aplicativo ou via notificações push.</p>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold transition-all shrink-0"
        >
          Limpar Todos os Canais
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formulário de Cadastro/Edição */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-4 h-fit">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
            {editingId ? 'Editar Aviso' : 'Novo Aviso'}
          </p>

          <form onSubmit={handleCreateOrUpdate} className="space-y-3">
            <div>
              <Label>Título do Aviso</Label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Últimos Minutos de Votação!"
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                maxLength={80}
                required
              />
            </div>

            <div>
              <Label>Mensagem</Label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Ex: Vá ao stand central e dê o seu voto final antes do cronômetro zerar."
                rows={3}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-none"
                maxLength={250}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Cor de Fundo</Label>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={form.bg_color}
                    onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))}
                    className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.bg_color}
                    onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))}
                    className="flex-1 bg-white border border-neutral-200 rounded-lg px-2 text-[10px] w-full"
                  />
                </div>
              </div>
              <div>
                <Label>Cor do Texto</Label>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={form.text_color}
                    onChange={e => setForm(f => ({ ...f, text_color: e.target.value }))}
                    className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.text_color}
                    onChange={e => setForm(f => ({ ...f, text_color: e.target.value }))}
                    className="flex-1 bg-white border border-neutral-200 rounded-lg px-2 text-[10px] w-full"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Ícone</Label>
                <select
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-2 py-2 text-xs"
                >
                  {iconsList.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Duração (segundos)</Label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={form.show_duration_sec}
                  onChange={e => setForm(f => ({ ...f, show_duration_sec: Number(e.target.value) || 15 }))}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-2 py-2 text-xs text-right"
                />
              </div>
            </div>

            <div>
              <Label>Som de Notificação</Label>
              <select
                value={form.audio_url || 'synth_classic'}
                onChange={e => setForm(f => ({ ...f, audio_url: e.target.value }))}
                className="w-full bg-white border border-neutral-200 rounded-xl px-2 py-2 text-xs focus:outline-none"
              >
                <option value="silent">Silencioso (Sem som)</option>
                <optgroup label="Sons Sintetizados (Padrão)">
                  <option value="synth_classic">Sino Clássico</option>
                  <option value="synth_scifi">Alerta Futurista (Sci-Fi)</option>
                  <option value="synth_triumph">Festa / Sucesso Triunfal</option>
                  <option value="synth_gentle">Atenção Suave</option>
                  <option value="synth_retro">Beep Retrô 8-Bit</option>
                </optgroup>
                {(event.custom_sounds || []).length > 0 && (
                  <optgroup label="Sons Personalizados">
                    {(event.custom_sounds || []).map(sound => (
                      <option key={sound.id} value={sound.url}>{sound.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Checkboxes de Canais */}
            <div className="bg-white p-3 rounded-xl border border-neutral-200 space-y-2">
              <Label>Canais de Destino</Label>
              
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.target_tv}
                  onChange={e => setForm(f => ({ ...f, target_tv: e.target.checked }))}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <Tv className="w-3.5 h-3.5 text-neutral-500" />
                <span>Telão / TV</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.target_app_popup}
                  onChange={e => setForm(f => ({ ...f, target_app_popup: e.target.checked }))}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                <span>Popup no App</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.target_push}
                  onChange={e => setForm(f => ({ ...f, target_push: e.target.checked }))}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <Bell className="w-3.5 h-3.5 text-neutral-500" />
                <span>Notificação Push</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? 'Salvando...' : editingId ? 'Atualizar Aviso' : 'Salvar Aviso'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold text-xs py-2 px-3 rounded-xl transition-all"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Biblioteca de Sons Customizados */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-3.5 h-fit shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-neutral-500" />
              Sons do Evento ({(event.custom_sounds || []).length}/3)
            </p>
            {uploadingAudio && (
              <div className="w-3.5 h-3.5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
            )}
          </div>

          <div className="space-y-2">
            {(event.custom_sounds || []).length === 0 ? (
              <div className="text-center py-5 bg-white border border-dashed border-neutral-200 rounded-xl px-2">
                <Music className="w-6 h-6 text-neutral-300 mx-auto mb-1.5" />
                <p className="text-[10px] font-bold text-neutral-600">Nenhum som carregado</p>
                <p className="text-[9px] text-neutral-400 mt-0.5">Suba até 3 arquivos MP3, WAV ou OGG para usar como toque nos avisos.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {(event.custom_sounds || []).map(sound => (
                  <div key={sound.id} className="bg-white border border-neutral-100 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-xs hover:border-neutral-200 transition-all">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-neutral-700 truncate" title={sound.name}>{sound.name}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handlePlayPreview(sound.id, sound.url)}
                        type="button"
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all border",
                          previewingSoundId === sound.id 
                            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                            : "bg-neutral-50 text-neutral-600 border-neutral-100 hover:bg-neutral-100"
                        )}
                      >
                        {previewingSoundId === sound.id ? (
                          <div className="w-2.5 h-2.5 bg-red-600 rounded-xs" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteSound(sound.id)}
                        type="button"
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-neutral-50 text-neutral-400 hover:text-red-600 border border-neutral-100 hover:bg-red-50 hover:border-red-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(event.custom_sounds || []).length < 3 && (
              <label className="flex items-center justify-center gap-1.5 border border-dashed border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 cursor-pointer py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 transition-all">
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] font-bold">Upload de Som (Máx. 2MB)</span>
                <input
                  type="file"
                  accept=".mp3,.wav,.ogg,audio/*"
                  onChange={handleUploadSound}
                  disabled={uploadingAudio}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Listagem de Avisos cadastrados */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Avisos Cadastrados</p>

          {announcements.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 border border-dashed border-neutral-200 rounded-2xl bg-white">
              <Megaphone className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold">Nenhum aviso cadastrado</p>
              <p className="text-xs mt-1">Utilize o formulário ao lado para criar o seu primeiro aviso.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {announcements.map(ann => (
                <div
                  key={ann.id}
                  className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-300 transition-all shadow-sm"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 shrink-0"
                        style={{ backgroundColor: ann.bg_color, color: ann.text_color }}
                      >
                        <Megaphone className="w-2.5 h-2.5" />
                        {ann.icon}
                      </span>
                      <h4 className="text-xs font-black text-neutral-900 truncate">{ann.title}</h4>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2 pr-4">{ann.message}</p>
                    
                    {/* Canais badge */}
                    <div className="flex gap-2 pt-1">
                      {ann.target_tv && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-md px-1.5 py-0.5">
                          <Tv className="w-2.5 h-2.5" /> TV ({ann.show_duration_sec}s)
                        </span>
                      )}
                      {ann.target_app_popup && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-md px-1.5 py-0.5">
                          <Smartphone className="w-2.5 h-2.5" /> App Popup
                        </span>
                      )}
                      {ann.target_push && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-md px-1.5 py-0.5">
                          <Bell className="w-2.5 h-2.5" /> Push
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3 md:border-t-0 md:pt-0 shrink-0">
                    <button
                      onClick={() => handleTrigger(ann.id)}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <Megaphone className="w-3.5 h-3.5" /> Disparar
                    </button>
                    <button
                      onClick={() => handleEdit(ann)}
                      className="p-2 border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-all"
                      title="Editar aviso"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="p-2 border border-neutral-200 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                      title="Remover aviso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

            {/* Aba Avisos */}
            {activeTab === 'avisos' && (
              <div className="max-w-4xl bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
                <AvisosSection event={event} onEventUpdate={(updatedEvent) => setEvent(updatedEvent)} />
              </div>
            )}

            {/* Aba 4 — Config. Avaliação */}
            {activeTab === 'avaliacao' && (
              <div className="space-y-8 max-w-3xl">
                <CategoriasAvaliacaoSection eventId={event.id} />
                <div className="border-t border-neutral-100" />
                <AvaliadorSection eventId={event.id} />
              </div>
            )}

            {/* Abas 5–7 — placeholders */}
            {(['sorteio', 'relatorios', 'marketing'] as const).includes(activeTab as any) && (
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
