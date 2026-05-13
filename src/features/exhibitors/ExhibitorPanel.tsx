import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Eye, EyeOff, RefreshCw,
  Package, Users, ShoppingBag, Phone, Copy, CheckCircle,
  Upload, X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Exhibitor, ExhibitorUser, Product, Lead } from '../../types';
import {
  subscribeToExhibitors, createExhibitor, updateExhibitor, deleteExhibitor,
  getExhibitorUsers, removeExhibitorUser, getNextExhibitorNumber,
} from '../../services/exhibitorService';
import { getProducts, createProduct, updateProduct, deactivateProduct } from '../../services/productService';
import { getLeads } from '../../services/leadService';
import {
  createExhibitorUser, resetExhibitorPassword,
  generatePassword, generateUsername,
} from '../../services/exhibitorAuthService';
import { subscribeToEvent } from '../../services/eventService';
import { uploadImage } from '../../services/storageService';
import type { EventData } from '../../types';

const MAX_PRODUCT_PHOTOS = 3;

// ─── Credential Display ────────────────────────────────────────────────────────

function CredentialDisplay({ username, password, onDismiss }: {
  username: string; password: string; onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const text = `Login: ${username}\nSenha: ${password}`;

  const copyAll = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
      <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
        Credenciais geradas — salve agora, não serão exibidas novamente
      </p>
      <div className="font-mono text-sm bg-white border border-amber-200 rounded-lg p-3 space-y-1">
        <div><span className="text-neutral-400">Login:</span> <span className="font-bold">{username}</span></div>
        <div><span className="text-neutral-400">Senha:</span> <span className="font-bold">{password}</span></div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={copyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold transition-colors"
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold transition-colors"
        >
          Ok, já salvei
        </button>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'dados' | 'produtos' | 'usuarios' | 'leads';

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
              <Save className="w-4 h-4" />
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

function UsersTab({ exhibitorId, exhibitorNumber, eventSlug }: {
  exhibitorId: string; exhibitorNumber: number; eventSlug: string;
}) {
  const [users, setUsers] = useState<ExhibitorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [creating, setCreating] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState<{ username: string; password: string } | null>(null);
  const [resetCreds, setResetCreds] = useState<{ userId: string; username: string; password: string } | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const load = () =>
    getExhibitorUsers(exhibitorId).then(setUsers).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, [exhibitorId]);

  const handleCreate = async () => {
    if (!newUserName.trim()) return;
    const username = generateUsername(exhibitorNumber, eventSlug, newUserName.trim());
    const password = generatePassword();
    setCreating(true);
    try {
      await createExhibitorUser({ username, password, exhibitorId });
      setGeneratedCreds({ username, password });
      setAddingUser(false);
      setNewUserName('');
      load();
    } catch (err: any) {
      if (err.message === 'USERNAME_TAKEN') {
        toast.error('Login já existe. Altere o nome para gerar um login único.');
      } else {
        toast.error('Erro ao criar usuário');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleReset = async (user: ExhibitorUser) => {
    const newPassword = generatePassword();
    setResettingId(user.id);
    try {
      await resetExhibitorPassword({ supabaseUserId: user.supabase_user_id, newPassword });
      setResetCreds({ userId: user.id, username: user.username, password: newPassword });
    } catch {
      toast.error('Erro ao resetar senha');
    } finally {
      setResettingId(null);
    }
  };

  const handleRemove = async (user: ExhibitorUser) => {
    if (!confirm(`Remover usuário ${user.username}?`)) return;
    try {
      await removeExhibitorUser(user.id);
      setUsers(us => us.filter(u => u.id !== user.id));
      toast.success('Usuário removido');
    } catch {
      toast.error('Erro ao remover usuário');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>;

  const previewUsername = newUserName.trim()
    ? generateUsername(exhibitorNumber, eventSlug, newUserName.trim())
    : null;

  return (
    <div className="space-y-4">
      {generatedCreds && (
        <CredentialDisplay
          username={generatedCreds.username}
          password={generatedCreds.password}
          onDismiss={() => setGeneratedCreds(null)}
        />
      )}
      {resetCreds && (
        <CredentialDisplay
          username={resetCreds.username}
          password={resetCreds.password}
          onDismiss={() => setResetCreds(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{users.length} usuário{users.length !== 1 ? 's' : ''}</p>
        {!addingUser && (
          <button
            onClick={() => setAddingUser(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar usuário
          </button>
        )}
      </div>

      {addingUser && (
        <div className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-neutral-50">
          <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Novo usuário expositor</p>
          <input
            type="text"
            placeholder="Nome do responsável (ex: Denis)"
            value={newUserName}
            onChange={e => setNewUserName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
          />
          {previewUsername && (
            <p className="text-xs text-neutral-500">
              Login gerado: <span className="font-mono font-semibold text-neutral-700">{previewUsername}</span>
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating || !newUserName.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Criando...' : 'Criar e gerar credenciais'}
            </button>
            <button
              onClick={() => { setAddingUser(false); setNewUserName(''); }}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {users.map(user => (
        <div key={user.id} className="flex items-center gap-3 p-3 border border-neutral-100 rounded-xl bg-white shadow-sm">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm font-semibold text-neutral-900 truncate">{user.username}</p>
            <p className="text-[10px] text-neutral-400">
              Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleReset(user)}
              disabled={resettingId === user.id}
              title="Resetar senha"
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${resettingId === user.id ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => handleRemove(user)}
              title="Remover usuário"
              className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Leads Tab ────────────────────────────────────────────────────────────────

function LeadsTab({ exhibitorId }: { exhibitorId: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeads(exhibitorId).then(setLeads).catch(() => {}).finally(() => setLoading(false));
  }, [exhibitorId]);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-500">{leads.length} lead{leads.length !== 1 ? 's' : ''} de pré-venda</p>
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
            </div>
            <p className="text-[10px] text-neutral-400 shrink-0">
              {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Exhibitor Detail ─────────────────────────────────────────────────────────

function ExhibitorDetail({ exhibitor, eventSlug, onUpdated }: {
  exhibitor: Exhibitor; eventSlug: string; onUpdated: () => void;
}) {
  const [tab, setTab] = useState<Tab>('dados');
  const [form, setForm] = useState({
    name: exhibitor.name,
    description: exhibitor.description || '',
    instagram_url: exhibitor.instagram_url || '',
    whatsapp: exhibitor.whatsapp || '',
    website_url: exhibitor.website_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logo, setLogo] = useState(exhibitor.logo_url || '');

  useEffect(() => {
    setForm({
      name: exhibitor.name,
      description: exhibitor.description || '',
      instagram_url: exhibitor.instagram_url || '',
      whatsapp: exhibitor.whatsapp || '',
      website_url: exhibitor.website_url || '',
    });
    setLogo(exhibitor.logo_url || '');
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

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Nome obrigatório');
    setSaving(true);
    try {
      await updateExhibitor(exhibitor.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        logo_url: logo || null,
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

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'dados', label: 'Dados', icon: <Package className="w-3.5 h-3.5" /> },
    { key: 'produtos', label: 'Produtos', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { key: 'usuarios', label: 'Usuários', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'leads', label: 'Leads', icon: <Phone className="w-3.5 h-3.5" /> },
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
      <div className="flex gap-1 mb-4 bg-neutral-100 p-1 rounded-xl">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === t.key
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'dados' && (
          <div className="space-y-3">
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
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Descrição</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-none"
              />
            </div>
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
          <UsersTab
            exhibitorId={exhibitor.id}
            exhibitorNumber={exhibitor.number}
            eventSlug={eventSlug}
          />
        )}
        {tab === 'leads' && <LeadsTab exhibitorId={exhibitor.id} />}
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

  useEffect(() => {
    if (!slug) return;
    const unsub = subscribeToEvent(slug, setEvent);
    return unsub;
  }, [slug]);

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
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 h-full overflow-hidden flex flex-col">
              <ExhibitorDetail
                exhibitor={selected}
                eventSlug={slug || ''}
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
