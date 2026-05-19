import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Package, ShoppingBag, Phone, Save,
  Upload, X, Plus, Trash2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useExhibitorAuth } from '../../hooks/useExhibitorAuth';
import { updateExhibitor } from '../../services/exhibitorService';
import { getProducts, createProduct, updateProduct, deactivateProduct } from '../../services/productService';
import { getLeads, updateLeadStatus } from '../../services/leadService';
import { uploadImage } from '../../services/storageService';
import type { Product, Lead, LeadStatus } from '../../types';

const MAX_PRODUCT_PHOTOS = 3;

type Tab = 'perfil' | 'produtos' | 'leads';

// ─── Perfil Tab ────────────────────────────────────────────────────────────────

function PerfilTab({ exhibitor, onUpdated }: { exhibitor: NonNullable<ReturnType<typeof useExhibitorAuth>['exhibitor']>; onUpdated: () => void }) {
  const [form, setForm] = useState({
    name: exhibitor.name,
    description: exhibitor.description || '',
    instagram_url: exhibitor.instagram_url || '',
    whatsapp: exhibitor.whatsapp || '',
    website_url: exhibitor.website_url || '',
  });
  const [logo, setLogo] = useState(exhibitor.logo_url || '');
  const [photo, setPhoto] = useState(exhibitor.photo_url || '');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

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
      toast.error('Erro ao fazer upload da foto do stand');
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
        description: form.description.trim() || null,
        logo_url: logo || null,
        photo_url: photo || null,
        instagram_url: form.instagram_url.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        website_url: form.website_url.trim() || null,
      });
      toast.success('Perfil atualizado!');
      onUpdated();
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Logo */}
      <div className="flex items-center gap-4">
        {logo ? (
          <img src={logo} className="w-20 h-20 rounded-2xl object-contain bg-neutral-50 border border-neutral-100 p-2 shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center shrink-0">
            <Package className="w-8 h-8 text-neutral-300" />
          </div>
        )}
        <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold cursor-pointer transition-colors">
          {uploadingLogo
            ? <div className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-700 rounded-full animate-spin" />
            : <Upload className="w-4 h-4" />}
          {uploadingLogo ? 'Enviando...' : 'Alterar logo'}
          <input type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} disabled={uploadingLogo} />
        </label>
      </div>

      {/* Foto do stand */}
      <div>
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">Foto do stand</label>
        <p className="text-[10px] text-neutral-400 mb-2">Exibida como banner no card do feed</p>
        {photo && (
          <div className="relative mb-2 rounded-2xl overflow-hidden aspect-video bg-neutral-100 border border-neutral-100">
            <img src={photo} className="w-full h-full object-cover" />
            <button
              onClick={() => setPhoto('')}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold cursor-pointer transition-colors w-fit">
          {uploadingPhoto
            ? <div className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-700 rounded-full animate-spin" />
            : <Upload className="w-4 h-4" />}
          {uploadingPhoto ? 'Enviando...' : photo ? 'Alterar foto' : 'Adicionar foto'}
          <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
        </label>
      </div>

      <div>
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">Nome *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">Descrição</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          placeholder="Conte sobre sua empresa..."
          className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-none"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">Instagram</label>
        <input
          type="text"
          placeholder="@usuario ou URL"
          value={form.instagram_url}
          onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">WhatsApp</label>
        <input
          type="text"
          placeholder="5511999999999"
          value={form.whatsapp}
          onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">Website</label>
        <input
          type="url"
          placeholder="https://..."
          value={form.website_url}
          onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </div>
  );
}

// ─── Products Tab (Expositor) ──────────────────────────────────────────────────

function ProdutosTab({ exhibitorId }: { exhibitorId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', photos: [] as string[] });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () =>
    getProducts(exhibitorId).then(setProducts).catch(() => {}).finally(() => setLoading(false));

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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{products.length} produto{products.length !== 1 ? 's' : ''}</p>
        {!editingId && (
          <button
            onClick={startNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Novo produto
          </button>
        )}
      </div>

      {editingId && (
        <div className="border border-neutral-200 rounded-2xl p-4 space-y-3 bg-neutral-50">
          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
            {editingId === 'new' ? 'Novo produto' : 'Editar produto'}
          </p>
          <input
            type="text"
            placeholder="Nome do produto *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
          />
          <textarea
            placeholder="Descrição do produto"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-none"
          />
          <input
            type="text"
            placeholder="Preço (ex: 99,90)"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
          />

          <div>
            <p className="text-xs text-neutral-500 mb-2">Fotos ({form.photos.length}/{MAX_PRODUCT_PHOTOS})</p>
            <div className="flex gap-2 flex-wrap">
              {form.photos.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200">
                  <img src={url} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }))}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {form.photos.length < MAX_PRODUCT_PHOTOS && (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors">
                  {uploading
                    ? <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
                    : <>
                        <Upload className="w-5 h-5 text-neutral-400" />
                        <span className="text-[10px] text-neutral-400 mt-1">Adicionar</span>
                      </>
                  }
                  <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-sm font-bold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {products.map(product => (
        <div key={product.id} className="flex items-center gap-3 p-3 border border-neutral-100 rounded-2xl bg-white shadow-sm">
          {product.photos[0] ? (
            <img src={product.photos[0]} className="w-14 h-14 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-neutral-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-neutral-900 truncate">{product.name}</p>
            {product.price != null && (
              <p className="text-xs text-neutral-500 font-semibold">
                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            )}
            <p className="text-[10px] text-neutral-400">{product.photos.length} foto{product.photos.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => startEdit(product)} className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors text-xs font-bold">
              Editar
            </button>
            <button
              onClick={async () => {
                if (!confirm('Remover produto?')) return;
                await deactivateProduct(product.id);
                setProducts(ps => ps.filter(p => p.id !== product.id));
              }}
              className="p-2 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Leads helpers ────────────────────────────────────────────────────────────

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

// ─── Leads Tab (Expositor) ─────────────────────────────────────────────────────

function LeadsTabExpositor({ exhibitorId, exhibitorName }: { exhibitorId: string; exhibitorName: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () =>
    getLeads(exhibitorId).then(setLeads).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, [exhibitorId]);

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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{leads.length} interesse{leads.length !== 1 ? 's' : ''} registrado{leads.length !== 1 ? 's' : ''}</p>
        {leads.length > 0 && (
          <button
            onClick={() => exportLeadsCSV(leads, exhibitorName)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors"
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
          <Phone className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum interesse de pré-venda ainda</p>
          <p className="text-xs mt-1">Quando participantes demonstrarem interesse em seus produtos, aparecerão aqui</p>
        </div>
      ) : (
        leads.map(lead => (
          <div key={lead.id} className="p-4 border border-neutral-100 rounded-2xl bg-white shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-neutral-900">{lead.customer_name}</p>
                <p className="text-sm text-neutral-600 font-medium">{lead.customer_phone}</p>
                {lead.product?.name && (
                  <p className="text-xs text-neutral-400 mt-0.5">Produto: {lead.product.name}</p>
                )}
                <p className="text-[10px] text-neutral-400 mt-1">
                  {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                  })}
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
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main Portal ───────────────────────────────────────────────────────────────

export default function ExhibitorPortal() {
  const navigate = useNavigate();
  const { exhibitorUser, exhibitor, loading, logout } = useExhibitorAuth();
  const [tab, setTab] = useState<Tab>('perfil');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !exhibitorUser) {
      navigate('/expositor/login', { replace: true });
    }
  }, [exhibitorUser, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/expositor/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!exhibitor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-lg font-bold text-neutral-900">Acesso não configurado</h1>
          <p className="text-sm text-neutral-500">
            Seu usuário não está vinculado a nenhum expositor. Entre em contato com a administração do evento.
          </p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'perfil', label: 'Perfil', icon: <Package className="w-4 h-4" /> },
    { key: 'produtos', label: 'Produtos', icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'leads', label: 'Leads', icon: <Phone className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {exhibitor.logo_url ? (
            <img src={exhibitor.logo_url} className="w-8 h-8 rounded-lg object-contain bg-neutral-50 border border-neutral-100 p-0.5" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-neutral-400" />
            </div>
          )}
          <div>
            <p className="font-bold text-sm text-neutral-900 leading-tight">{exhibitor.name}</p>
            <p className="text-[10px] text-neutral-400">Área do Expositor</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-neutral-100 px-4">
        <div className="flex gap-0 max-w-2xl mx-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 pb-12">
        {tab === 'perfil' && (
          <PerfilTab exhibitor={exhibitor} onUpdated={() => setRefreshKey(k => k + 1)} />
        )}
        {tab === 'produtos' && <ProdutosTab key={refreshKey} exhibitorId={exhibitor.id} />}
        {tab === 'leads' && <LeadsTabExpositor exhibitorId={exhibitor.id} exhibitorName={exhibitor.name} />}
      </div>
    </div>
  );
}
