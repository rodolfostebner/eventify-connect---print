import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Eye, EyeOff,
  Package, Users, ShoppingBag, Phone,
  Upload, X, Pencil,
  BarChart2, MessageCircle, Globe, Share2, ShoppingCart, Instagram,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Exhibitor, Product, Lead, LeadStatus, UserEmailRole, ExhibitorCategory } from '../../types';
import { getExhibitorCategories } from '../../services/exhibitorCategoryService';
import {
  subscribeToExhibitors, createExhibitor, updateExhibitor, deleteExhibitor,
  getExhibitorUsers, removeExhibitorUser, getNextExhibitorNumber,
} from '../../services/exhibitorService';
import { getProducts, createProduct, updateProduct, deactivateProduct } from '../../services/productService';
import { getLeads, updateLeadStatus } from '../../services/leadService';
import { getExhibitorVisitSummary, getTopProducts } from '../../services/visitService';
import { addEmailRole, removeEmailRole, listEmailRoles } from '../../services/userService';
import type { ExhibitorLinkedUser } from '../../services/userService';
import { subscribeToEvent } from '../../services/eventService';
import { uploadImage } from '../../services/storageService';
import type { EventData, VisitAction } from '../../types';

const MAX_PRODUCT_PHOTOS = 3;

// Garante que o valor atual apareça na lista mesmo se a categoria tiver sido removida do evento
function mergeCategoryOptions(categories: ExhibitorCategory[], current?: string): ExhibitorCategory[] {
  if (!current || categories.some(c => c.name === current)) return categories;
  return [...categories, { id: '', event_id: '', name: current, icon: '🏷️', color: '#94949E', order_index: 999, created_at: '' }];
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'dados' | 'fotos' | 'contatos' | 'produtos' | 'usuarios' | 'leads' | 'visualizacoes';

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab({ exhibitorId }: { exhibitorId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', photos: [] as string[] });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () =>
    getProducts(exhibitorId).then(setProducts).catch(() => toast.error('Erro ao carregar produtos')).finally(() => setLoading(false));

  useEffect(() => { load(); }, [exhibitorId]);

  const startNew = () => {
    setForm({ name: '', description: '', price: '', photos: [] });
    setEditingId('new');
  };

  const startEdit = (p: Product) => {
    setForm({ name: p.name, description: p.description || '', price: p.price?.toString() || '', photos: p.photos });
    setEditingId(p.id);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || form.photos.length >= MAX_PRODUCT_PHOTOS) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm(f => ({ ...f, photos: [...f.photos, url] }));
    } catch {
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (idx: number) =>
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Nome obrigatório');
    setSaving(true);
    try {
      const payload = {
        exhibitor_id: exhibitorId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: form.price ? parseFloat(form.price.replace(',', '.')) : null,
        photos: form.photos,
        active: true,
      };
      if (editingId === 'new') {
        await createProduct(payload);
      } else {
        await updateProduct(editingId!, payload);
      }
      toast.success('Produto salvo!');
      setEditingId(null);
      load();
    } catch {
      toast.error('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Remover produto do catálogo?')) return;
    try {
      await deactivateProduct(id);
      setProducts(ps => ps.filter(p => p.id !== id));
      toast.success('Produto removido');
    } catch {
      toast.error('Erro ao remover produto');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{products.length} produto{products.length !== 1 ? 's' : ''}</p>
        {!editingId && (
          <button onClick={startNew} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Novo produto
          </button>
        )}
      </div>

      {editingId && (
        <div className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-neutral-50">
          <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
            {editingId === 'new' ? 'Novo produto' : 'Editar produto'}
          </p>
          <input
            type="text"
            placeholder="Nome do produto *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
          />
          <textarea
            placeholder="Descrição"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-none"
          />
          <input
            type="text"
            placeholder="Preço (ex: 99,90)"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
          />

          {/* Photos */}
          <div>
            <p className="text-xs text-neutral-500 mb-2">Fotos ({form.photos.length}/{MAX_PRODUCT_PHOTOS})</p>
            <div className="flex gap-2 flex-wrap">
              {form.photos.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200">
                  <img src={url} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {form.photos.length < MAX_PRODUCT_PHOTOS && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors">
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-neutral-400" />
                      <span className="text-[10px] text-neutral-400 mt-0.5">Foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {products.map(product => (
        <div key={product.id} className="flex items-center gap-3 p-3 border border-neutral-100 rounded-xl bg-white shadow-sm">
          {product.photos[0] ? (
            <img src={product.photos[0]} className="w-12 h-12 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-neutral-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-neutral-900 truncate">{product.name}</p>
            {product.price != null && (
              <p className="text-xs text-neutral-500">
                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => startEdit(product)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => handleDeactivate(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ exhibitorId }: { exhibitorId: string }) {
  const [linked, setLinked] = useState<ExhibitorLinkedUser[]>([]);
  const [pending, setPending] = useState<UserEmailRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [linkedData, allPending] = await Promise.all([
      getExhibitorUsers(exhibitorId),
      listEmailRoles(),
    ]);
    setLinked(linkedData);
    setPending(allPending.filter(r => r.exhibitor_id === exhibitorId));
    setLoading(false);
  };

  useEffect(() => { load(); }, [exhibitorId]);

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    setSaving(true);
    try {
      await addEmailRole({ email: newEmail.trim().toLowerCase(), role: 'expositor', event_id: null, exhibitor_id: exhibitorId });
      toast.success('E-mail cadastrado — o expositor poderá entrar com Google ou link mágico.');
      setNewEmail('');
      setAdding(false);
      load();
    } catch {
      toast.error('Erro ao cadastrar e-mail');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLinked = async (user: ExhibitorLinkedUser) => {
    if (!confirm(`Remover acesso de ${user.email}?`)) return;
    try {
      await removeExhibitorUser(user.id);
      setLinked(ls => ls.filter(l => l.id !== user.id));
      toast.success('Acesso removido');
    } catch {
      toast.error('Erro ao remover acesso');
    }
  };

  const handleRemovePending = async (email: string) => {
    if (!confirm(`Cancelar convite para ${email}?`)) return;
    try {
      await removeEmailRole(email);
      setPending(ps => ps.filter(p => p.email !== email));
      toast.success('Convite cancelado');
    } catch {
      toast.error('Erro ao cancelar convite');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{linked.length} ativo{linked.length !== 1 ? 's' : ''} · {pending.length} pendente{pending.length !== 1 ? 's' : ''}</p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Cadastrar e-mail
          </button>
        )}
      </div>

      {adding && (
        <div className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-neutral-50">
          <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Novo acesso expositor</p>
          <input
            type="email"
            placeholder="email@expositor.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
          />
          <p className="text-xs text-neutral-400">O expositor entrará com este e-mail via Google ou link mágico.</p>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !newEmail.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Salvando...' : 'Cadastrar'}
            </button>
            <button
              onClick={() => { setAdding(false); setNewEmail(''); }}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {linked.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Acessos ativos</p>
          {linked.map(user => (
            <div key={user.id} className="flex items-center gap-3 p-3 border border-neutral-100 rounded-xl bg-white shadow-sm">
              {user.photo_url ? (
                <img src={user.photo_url} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-neutral-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{user.display_name ?? user.email}</p>
                <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => handleRemoveLinked(user)}
                title="Remover acesso"
                className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Aguardando primeiro login</p>
          {pending.map(p => (
            <div key={p.email} className="flex items-center gap-3 p-3 border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-600 truncate">{p.email}</p>
                <p className="text-[10px] text-neutral-400">Pendente — não fez login ainda</p>
              </div>
              <button
                onClick={() => handleRemovePending(p.email)}
                title="Cancelar convite"
                className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {linked.length === 0 && pending.length === 0 && (
        <div className="text-center py-8 text-neutral-400">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum usuário cadastrado</p>
          <p className="text-xs mt-1">Cadastre o e-mail do expositor para liberar acesso</p>
        </div>
      )}
    </div>
  );
}

// ─── Leads Tab ────────────────────────────────────────────────────────────────

const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  novo: 'Novo',
  atendido: 'Atendido',
  pago: 'Pago',
  retirado: 'Retirado',
};

const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  novo: 'bg-blue-100 text-blue-700',
  atendido: 'bg-amber-100 text-amber-700',
  pago: 'bg-green-100 text-green-700',
  retirado: 'bg-neutral-100 text-neutral-500',
};

function exportLeadsCSV(leads: Lead[], exhibitorName: string) {
  const BOM = '﻿';
  const header = ['Nome', 'Telefone', 'Produto', 'Status', 'Data'];
  const rows = leads.map(l => [
    l.customer_name,
    l.customer_phone,
    l.product?.name ?? '',
    LEAD_STATUS_LABEL[l.status] ?? l.status,
    new Date(l.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  ]);
  const csv = BOM + [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_${exhibitorName.toLowerCase().replace(/\s+/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function LeadsTab({ exhibitorId, exhibitorName }: { exhibitorId: string; exhibitorName: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getLeads(exhibitorId).then(setLeads).catch(() => {}).finally(() => setLoading(false));
  }, [exhibitorId]);

  const handleStatusChange = async (lead: Lead, status: LeadStatus) => {
    setUpdatingId(lead.id);
    try {
      await updateLeadStatus(lead.id, status);
      setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, status } : l));
    } catch {
      toast.error('Erro ao atualizar status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{leads.length} lead{leads.length !== 1 ? 's' : ''} de pré-venda</p>
        {leads.length > 0 && (
          <button
            onClick={() => exportLeadsCSV(leads, exhibitorName)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar Excel
          </button>
        )}
      </div>
      {leads.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <Phone className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum interesse registrado ainda</p>
        </div>
      ) : (
        leads.map(lead => (
          <div key={lead.id} className="flex items-center gap-3 p-3 border border-neutral-100 rounded-xl bg-white shadow-sm">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-neutral-900">{lead.customer_name}</p>
              <p className="text-xs text-neutral-500">{lead.customer_phone}</p>
              {lead.product?.name && (
                <p className="text-[10px] text-neutral-400">Produto: {lead.product.name}</p>
              )}
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <select
              value={lead.status ?? 'novo'}
              disabled={updatingId === lead.id}
              onChange={e => handleStatusChange(lead, e.target.value as LeadStatus)}
              className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-900/20 disabled:opacity-50 ${LEAD_STATUS_STYLE[lead.status ?? 'novo']}`}
            >
              {(Object.keys(LEAD_STATUS_LABEL) as LeadStatus[]).map(s => (
                <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Visualizações Tab ────────────────────────────────────────────────────────

const ACTION_META: Record<VisitAction, { label: string; icon: React.ReactNode; color: string }> = {
  view_stand:      { label: 'Visitas ao stand',      icon: <Eye className="w-4 h-4" />,            color: 'bg-blue-50 text-blue-600' },
  view_product:    { label: 'Views de produto',       icon: <Package className="w-4 h-4" />,         color: 'bg-purple-50 text-purple-600' },
  click_lead:      { label: 'Interesses de compra',   icon: <ShoppingCart className="w-4 h-4" />,    color: 'bg-green-50 text-green-600' },
  click_instagram: { label: 'Cliques no Instagram',   icon: <Instagram className="w-4 h-4" />,       color: 'bg-pink-50 text-pink-600' },
  click_whatsapp:  { label: 'Cliques no WhatsApp',    icon: <MessageCircle className="w-4 h-4" />,   color: 'bg-emerald-50 text-emerald-600' },
  click_website:   { label: 'Cliques no site',        icon: <Globe className="w-4 h-4" />,           color: 'bg-sky-50 text-sky-600' },
  share:           { label: 'Compartilhamentos',      icon: <Share2 className="w-4 h-4" />,          color: 'bg-amber-50 text-amber-600' },
};

function VisualizacoesTab({ exhibitorId }: { exhibitorId: string }) {
  const [summary, setSummary] = useState<{ action: VisitAction; count: number }[]>([]);
  const [topProds, setTopProds] = useState<{ product_id: string; count: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [visits, tops, prods] = await Promise.all([
          getExhibitorVisitSummary(exhibitorId),
          getTopProducts(exhibitorId, 5),
          getProducts(exhibitorId),
        ]);
        setSummary(visits);
        const nameById = new Map(prods.map(p => [p.id, p.name]));
        setTopProds(tops.map(t => ({ ...t, name: nameById.get(t.product_id) ?? 'Produto' })));
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [exhibitorId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  const total = summary.reduce((s, r) => s + r.count, 0);
  const countByAction = new Map(summary.map(r => [r.action, r.count]));

  return (
    <div className="space-y-5">
      {/* Total */}
      <div className="bg-neutral-900 text-white rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-black">{total.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-white/60">interações totais no stand</p>
        </div>
      </div>

      {/* Grid de ações */}
      <div>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Detalhamento por ação</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(ACTION_META) as VisitAction[]).map(action => {
            const meta = ACTION_META[action];
            const count = countByAction.get(action) ?? 0;
            return (
              <div key={action} className="bg-neutral-50 border border-neutral-100 rounded-xl p-3 flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                  {meta.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-black text-neutral-900">{count.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-neutral-500 leading-tight">{meta.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top produtos */}
      {topProds.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Produtos mais vistos</p>
          <div className="space-y-1.5">
            {topProds.map((p, i) => {
              const pct = topProds[0].count > 0 ? (p.count / topProds[0].count) * 100 : 0;
              return (
                <div key={p.product_id} className="bg-neutral-50 border border-neutral-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-black text-neutral-400 w-3 shrink-0">{i + 1}</span>
                      <span className="text-sm font-semibold text-neutral-900 truncate">{p.name}</span>
                    </div>
                    <span className="text-sm font-black text-neutral-900 shrink-0">{p.count.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-8 text-neutral-400">
          <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma visita registrada ainda</p>
        </div>
      )}
    </div>
  );
}

// ─── Exhibitor Detail ─────────────────────────────────────────────────────────

function ExhibitorDetail({ exhibitor, eventSlug, categories, onUpdated }: {
  exhibitor: Exhibitor; eventSlug: string; categories: ExhibitorCategory[]; onUpdated: () => void;
}) {
  const [tab, setTab] = useState<Tab>('dados');
  const [form, setForm] = useState({
    name: exhibitor.name,
    category: exhibitor.category || 'Outros',
    tagline: exhibitor.tagline || '',
    description: exhibitor.description || '',
    ano: exhibitor.ano || '',
    turma: exhibitor.turma || '',
    instagram_url: exhibitor.instagram_url || '',
    whatsapp: exhibitor.whatsapp || '',
    website_url: exhibitor.website_url || '',
  });
  const [members, setMembers] = useState<string[]>(exhibitor.members ?? []);
  const [newMember, setNewMember] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [logo, setLogo] = useState(exhibitor.logo_url || '');
  const [photo, setPhoto] = useState(exhibitor.photo_url || '');

  useEffect(() => {
    setForm({
      name: exhibitor.name,
      category: exhibitor.category || 'Outros',
      tagline: exhibitor.tagline || '',
      description: exhibitor.description || '',
      ano: exhibitor.ano || '',
      turma: exhibitor.turma || '',
      instagram_url: exhibitor.instagram_url || '',
      whatsapp: exhibitor.whatsapp || '',
      website_url: exhibitor.website_url || '',
    });
    setMembers(exhibitor.members ?? []);
    setLogo(exhibitor.logo_url || '');
    setPhoto(exhibitor.photo_url || '');
  }, [exhibitor.id]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(file);
      setLogo(url);
    } catch {
      toast.error('Erro ao fazer upload do logo');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file);
      setPhoto(url);
    } catch {
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Nome obrigatório');
    setSaving(true);
    try {
      await updateExhibitor(exhibitor.id, {
        name: form.name.trim(),
        category: form.category,
        tagline: form.tagline.trim() || null,
        description: form.description.trim() || null,
        ano: form.ano.trim() || null,
        turma: form.turma.trim() || null,
        members,
        logo_url: logo || null,
        photo_url: photo || null,
        instagram_url: form.instagram_url.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        website_url: form.website_url.trim() || null,
      });
      toast.success('Expositor atualizado!');
      onUpdated();
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dados', label: 'Dados' },
    { key: 'fotos', label: 'Fotos' },
    { key: 'contatos', label: 'Contatos' },
    { key: 'produtos', label: 'Produtos' },
    { key: 'usuarios', label: 'Usuários' },
    { key: 'leads', label: 'Leads' },
    { key: 'visualizacoes', label: 'Visitas' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 mb-4">
        {logo ? (
          <img src={logo} className="w-12 h-12 rounded-xl object-contain bg-neutral-50 border border-neutral-100 p-1 shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-neutral-400" />
          </div>
        )}
        <div>
          <h2 className="font-bold text-neutral-900">{exhibitor.name}</h2>
          <p className="text-xs text-neutral-400">Expositor #{exhibitor.number}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-100 mb-4 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-2.5 text-[11px] font-bold whitespace-nowrap border-b-2 transition-all ${
              tab === t.key
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Aba Dados ── */}
        {tab === 'dados' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Categoria</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20 bg-white"
              >
                {mergeCategoryOptions(categories, form.category).map(c => (
                  <option key={c.id || c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Frase Chamada</label>
                <span className={`text-[10px] font-bold ${form.tagline.length > 50 ? 'text-red-500' : 'text-neutral-400'}`}>{form.tagline.length}/50</span>
              </div>
              <input
                type="text"
                maxLength={50}
                placeholder="Ex: O melhor açaí da feira!"
                value={form.tagline}
                onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Descrição</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Ano</label>
                <input
                  type="text"
                  placeholder="Ex: 3º"
                  value={form.ano}
                  onChange={e => setForm(f => ({ ...f, ano: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Turma</label>
                <input
                  type="text"
                  placeholder="Ex: A"
                  value={form.turma}
                  onChange={e => setForm(f => ({ ...f, turma: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
              </div>
            </div>

            {/* Integrantes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Integrantes</label>
                <span className="text-[10px] text-neutral-400">{members.length} cadastrado{members.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1.5 mb-2">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-neutral-100 rounded-lg">
                    <span className="flex-1 text-sm text-neutral-700 truncate">{m}</span>
                    <button
                      type="button"
                      onClick={() => setMembers(ms => ms.filter((_, idx) => idx !== i))}
                      className="p-0.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome do integrante"
                  value={newMember}
                  onChange={e => setNewMember(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const v = newMember.trim();
                      if (v) { setMembers(ms => [...ms, v]); setNewMember(''); }
                    }
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                />
                <button
                  type="button"
                  onClick={() => { const v = newMember.trim(); if (v) { setMembers(ms => [...ms, v]); setNewMember(''); } }}
                  disabled={!newMember.trim()}
                  className="px-3 py-2 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Aba Fotos ── */}
        {tab === 'fotos' && (
          <div className="space-y-4">
            {/* Logo */}
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Logo</label>
              <div className="flex items-center gap-3">
                {logo && <img src={logo} className="w-16 h-16 rounded-xl object-contain bg-neutral-50 border border-neutral-100 p-1" />}
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold cursor-pointer transition-colors">
                  {uploadingLogo ? <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-neutral-700 rounded-full animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {uploadingLogo ? 'Enviando...' : 'Alterar logo'}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
              </div>
            </div>

            {/* Foto do stand */}
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Foto do stand</label>
              <p className="text-[10px] text-neutral-400 mb-2">Exibida como banner no card do expositor no feed</p>
              {photo && (
                <div className="relative mb-2 rounded-xl overflow-hidden aspect-video bg-neutral-100 border border-neutral-100 max-w-xs">
                  <img src={photo} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhoto('')}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold cursor-pointer transition-colors w-fit">
                {uploadingPhoto ? <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-neutral-700 rounded-full animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploadingPhoto ? 'Enviando...' : photo ? 'Alterar foto' : 'Adicionar foto'}
                <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
              </label>
            </div>
          </div>
        )}

        {/* ── Aba Contatos ── */}
        {tab === 'contatos' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Instagram</label>
              <input
                type="text"
                placeholder="@usuario ou URL"
                value={form.instagram_url}
                onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">WhatsApp</label>
              <input
                type="text"
                placeholder="5511999999999"
                value={form.whatsapp}
                onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Website</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.website_url}
                onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
              />
            </div>
          </div>
        )}

        {/* Salvar — abas de dados do expositor */}
        {(tab === 'dados' || tab === 'fotos' || tab === 'contatos') && (
          <div className="pt-4 mt-2 border-t border-neutral-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        )}

        {tab === 'produtos' && <ProductsTab exhibitorId={exhibitor.id} />}
        {tab === 'usuarios' && (
          <UsersTab exhibitorId={exhibitor.id} />
        )}
        {tab === 'leads' && <LeadsTab exhibitorId={exhibitor.id} exhibitorName={exhibitor.name} />}
        {tab === 'visualizacoes' && <VisualizacoesTab exhibitorId={exhibitor.id} />}
      </div>
    </div>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────────

export default function ExhibitorPanel() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [selected, setSelected] = useState<Exhibitor | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [exhibitorCategories, setExhibitorCategories] = useState<ExhibitorCategory[]>([]);

  useEffect(() => {
    if (!slug) return;
    const unsub = subscribeToEvent(slug, setEvent);
    return unsub;
  }, [slug]);

  useEffect(() => {
    if (!event?.id) return;
    getExhibitorCategories(event.id).then(setExhibitorCategories).catch(() => {});
  }, [event?.id]);

  useEffect(() => {
    if (!event?.id) return;
    const unsub = subscribeToExhibitors(event.id, list => {
      setExhibitors(list);
      if (selected) {
        const updated = list.find(e => e.id === selected.id);
        if (updated) setSelected(updated);
      }
    });
    return unsub;
  }, [event?.id]);

  const handleCreate = async () => {
    if (!newName.trim() || !event?.id) return;
    setCreating(true);
    try {
      const number = await getNextExhibitorNumber(event.id);
      const created = await createExhibitor({
        event_id: event.id,
        number,
        name: newName.trim(),
        category: 'Outros',
        status: 'active',
      });
      setNewName('');
      setCreating(false);
      setSelected(created);
      toast.success('Expositor criado!');
    } catch {
      toast.error('Erro ao criar expositor');
      setCreating(false);
    }
  };

  const handleDelete = async (ex: Exhibitor) => {
    if (!confirm(`Excluir "${ex.name}"? Todos os produtos e leads serão removidos.`)) return;
    try {
      await deleteExhibitor(ex.id);
      if (selected?.id === ex.id) setSelected(null);
      toast.success('Expositor excluído');
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Painel de Expositores</h1>
          {event && <p className="text-xs text-neutral-500">{event.name}</p>}
        </div>
      </header>

      <div className="flex h-[calc(100vh-69px)]">
        {/* Sidebar — Exhibitor List */}
        <aside className="w-72 shrink-0 bg-white border-r border-neutral-100 flex flex-col">
          <div className="p-4 border-b border-neutral-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do expositor"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="p-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {exhibitors.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">Nenhum expositor cadastrado</p>
            ) : (
              exhibitors.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => setSelected(ex)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer group transition-colors ${
                    selected?.id === ex.id
                      ? 'bg-neutral-900 text-white'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {ex.logo_url ? (
                    <img src={ex.logo_url} className="w-8 h-8 rounded-lg object-contain bg-neutral-50 p-0.5 shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{ex.name}</p>
                    <p className={`text-[10px] ${selected?.id === ex.id ? 'text-neutral-400' : 'text-neutral-400'}`}>
                      #{ex.number}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(ex); }}
                    className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                      selected?.id === ex.id ? 'hover:bg-white/10 text-white' : 'hover:bg-red-50 text-neutral-400 hover:text-red-500'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Detail Area */}
        <main className="flex-1 overflow-hidden p-6">
          {selected ? (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 h-full overflow-hidden flex flex-col max-w-3xl">
              <ExhibitorDetail
                exhibitor={selected}
                eventSlug={slug || ''}
                categories={exhibitorCategories}
                onUpdated={() => {}}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Selecione um expositor para gerenciar</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
