import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  ArrowLeft, Plus, Trash2, Save, Upload, X, Handshake,
  ChevronLeft, ChevronRight, BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Partner, PartnerType, EventData } from '../../types';
import {
  subscribeToPartners, createPartner, updatePartner, deletePartner,
} from '../../services/partnerService';
import { subscribeToEvent } from '../../services/eventService';
import { uploadImage } from '../../services/storageService';
import { cn } from '../../lib/utils';

const MAX_PHOTOS = 3;

const TYPE_OPTIONS: { value: PartnerType; label: string }[] = [
  { value: 'patrocinador', label: 'Patrocinador' },
  { value: 'apoiador', label: 'Apoiador' },
  { value: 'servico', label: 'Serviço' },
];

const typeLabel = (t: PartnerType) => TYPE_OPTIONS.find(o => o.value === t)?.label ?? t;

const TABS = [
  { id: 'dados', label: 'Dados' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'contatos', label: 'Contatos Marketing' },
  { id: 'visualizacao', label: 'Visualização' },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Toggle ────────────────────────────────────────────────────────────────────

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

// ─── Photo Carousel (preview compacto) ─────────────────────────────────────────

function PhotoCarousel({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [photos.length]);
  if (photos.length === 0) return null;

  return (
    <div className="relative max-w-xs">
      <div className="aspect-video rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100">
        <img src={photos[index]} className="w-full h-full object-cover" />
      </div>
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            disabled={index === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white disabled:opacity-20 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIndex(i => Math.min(photos.length - 1, i + 1))}
            disabled={index === photos.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white disabled:opacity-20 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="flex justify-center gap-1.5 mt-2">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'bg-neutral-900 w-4' : 'bg-neutral-300 w-1.5'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Partner Detail ──────────────────────────────────────────────────────────

function PartnerDetail({ partner }: { partner: Partner }) {
  const buildForm = (p: Partner) => ({
    name: p.name,
    type: p.type,
    description: p.description || '',
    sponsorship_value: p.sponsorship_value != null ? String(p.sponsorship_value) : '',
    show_on_tv: p.show_on_tv,
    show_on_feed: p.show_on_feed,
    instagram_url: p.instagram_url || '',
    tiktok_url: p.tiktok_url || '',
    youtube_url: p.youtube_url || '',
    whatsapp: p.whatsapp || '',
    website_url: p.website_url || '',
    email: p.email || '',
    phone: p.phone || '',
  });

  const [form, setForm] = useState(() => buildForm(partner));
  const [logo, setLogo] = useState(partner.logo_url || '');
  const [photos, setPhotos] = useState<string[]>(partner.photos);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<TabId>('dados');

  useEffect(() => {
    setForm(buildForm(partner));
    setLogo(partner.logo_url || '');
    setPhotos(partner.photos);
    setTab('dados');
  }, [partner.id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || photos.length >= MAX_PHOTOS) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setPhotos(p => [...p, url]);
    } catch {
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(file);
      setLogo(url);
    } catch {
      toast.error('Erro ao fazer upload da logo');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Nome obrigatório');
    setSaving(true);
    try {
      // Valor do patrocínio só faz sentido para o tipo patrocinador
      const value = form.type === 'patrocinador' && form.sponsorship_value.trim()
        ? Number(form.sponsorship_value)
        : null;
      await updatePartner(partner.id, {
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim() || null,
        logo_url: logo || null,
        sponsorship_value: value,
        show_on_tv: form.show_on_tv,
        show_on_feed: form.show_on_feed,
        photos,
        instagram_url: form.instagram_url.trim() || null,
        tiktok_url: form.tiktok_url.trim() || null,
        youtube_url: form.youtube_url.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        website_url: form.website_url.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      });
      toast.success('Parceiro atualizado!');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const labelCls = 'text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5';
  const inputCls = 'w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/20';

  return (
    <div className="flex flex-col h-full">
      {/* Header do detalhe */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 mb-4">
        {(logo || photos[0]) ? (
          <img src={logo || photos[0]} className="w-12 h-12 rounded-xl object-contain bg-neutral-50 border border-neutral-100 shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
            <Handshake className="w-6 h-6 text-neutral-400" />
          </div>
        )}
        <div>
          <h2 className="font-bold text-neutral-900">{partner.name}</h2>
          <p className="text-xs text-neutral-400">{typeLabel(partner.type)}</p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-neutral-100 mb-4 overflow-x-auto">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'px-3.5 py-2.5 text-[11px] font-bold whitespace-nowrap border-b-2 transition-all',
              tab === id ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-700',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* ── Aba Dados ── */}
        {tab === 'dados' && (
          <>
            <div>
              <label className={labelCls}>Logo</label>
              <div className="flex items-center gap-3">
                {logo ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 shrink-0">
                    <img src={logo} className="w-full h-full object-contain" />
                    <button onClick={() => setLogo('')} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors shrink-0">
                    {uploadingLogo
                      ? <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
                      : <><Upload className="w-5 h-5 text-neutral-400" /><span className="text-[10px] text-neutral-400 mt-1">Logo</span></>
                    }
                    <input type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                )}
                <p className="text-[10px] text-neutral-400">Exibida como ícone do parceiro no feed e no painel.</p>
              </div>
            </div>

            <div>
              <label className={labelCls}>Nome *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Tipo</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PartnerType }))} className={inputCls}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Descrição</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={cn(inputCls, 'resize-none')} />
            </div>

            {form.type === 'patrocinador' && (
              <div>
                <label className={labelCls}>Valor do Patrocínio (R$) <span className="text-neutral-400 normal-case font-normal">(uso interno)</span></label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.sponsorship_value}
                  onChange={e => setForm(f => ({ ...f, sponsorship_value: e.target.value }))}
                  placeholder="0,00"
                  className={inputCls}
                />
                <p className="text-[10px] text-neutral-400 mt-1">Usado apenas no relatório financeiro do evento.</p>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <div>
                <p className="text-xs font-bold text-neutral-800">Mostra no Telão</p>
                <p className="text-[10px] text-neutral-400">Exibir no painel TV</p>
              </div>
              <Toggle value={form.show_on_tv} onChange={() => setForm(f => ({ ...f, show_on_tv: !f.show_on_tv }))} />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
              <div>
                <p className="text-xs font-bold text-neutral-800">Mostra no Feed</p>
                <p className="text-[10px] text-neutral-400">Exibir na página do evento</p>
              </div>
              <Toggle value={form.show_on_feed} onChange={() => setForm(f => ({ ...f, show_on_feed: !f.show_on_feed }))} />
            </div>
          </>
        )}

        {/* ── Aba Fotos ── */}
        {tab === 'fotos' && (
          <>
            <PhotoCarousel photos={photos} />
            <div>
              <label className={labelCls}>Fotos de Marketing ({photos.length}/{MAX_PHOTOS})</label>
              <div className="flex gap-2 flex-wrap">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-200">
                    <img src={url} className="w-full h-full object-cover" />
                    <button onClick={() => setPhotos(p => p.filter((_, i) => i !== idx))} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors">
                    {uploading
                      ? <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
                      : <><Upload className="w-5 h-5 text-neutral-400" /><span className="text-[10px] text-neutral-400 mt-1">Adicionar</span></>
                    }
                    <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Aba Contatos Marketing ── */}
        {tab === 'contatos' && (
          <>
            <div>
              <label className={labelCls}>Instagram</label>
              <input type="text" placeholder="@usuario ou URL" value={form.instagram_url} onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>TikTok</label>
              <input type="text" placeholder="@usuario ou URL" value={form.tiktok_url} onChange={e => setForm(f => ({ ...f, tiktok_url: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>YouTube</label>
              <input type="text" placeholder="@canal ou URL" value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input type="text" placeholder="5511999999999" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input type="tel" placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>E-mail</label>
              <input type="email" placeholder="contato@parceiro.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input type="url" placeholder="https://..." value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} className={inputCls} />
            </div>
          </>
        )}

        {/* ── Aba Visualização (analytics) ── */}
        {tab === 'visualizacao' && (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
            <BarChart3 className="w-10 h-10 mb-3" />
            <p className="text-sm font-bold text-neutral-400">Em definição</p>
            <p className="text-xs mt-1">Os dados de analytics do parceiro serão exibidos aqui.</p>
          </div>
        )}
      </div>

      {/* Salvar (não aparece na aba de visualização) */}
      {tab !== 'visualizacao' && (
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
    </div>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────────

export default function PartnerPanel() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selected, setSelected] = useState<Partner | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!slug) return;
    return subscribeToEvent(slug, setEvent);
  }, [slug]);

  useEffect(() => {
    if (!event?.id) return;
    return subscribeToPartners(event.id, list => {
      setPartners(list);
      setSelected(prev => (prev ? list.find(p => p.id === prev.id) ?? prev : prev));
    });
  }, [event?.id]);

  const handleCreate = async () => {
    if (!newName.trim() || !event?.id) return;
    setCreating(true);
    try {
      const created = await createPartner({
        event_id: event.id,
        name: newName.trim(),
        type: 'patrocinador',
        description: null,
        logo_url: null,
        sponsorship_value: null,
        show_on_tv: true,
        show_on_feed: true,
        photos: [],
        instagram_url: null,
        tiktok_url: null,
        youtube_url: null,
        whatsapp: null,
        website_url: null,
        email: null,
        phone: null,
        order_index: partners.length,
        active: true,
      });
      setNewName('');
      setSelected(created);
      toast.success('Parceiro criado!');
    } catch {
      toast.error('Erro ao criar parceiro');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (p: Partner) => {
    if (!confirm(`Excluir "${p.name}"?`)) return;
    try {
      await deletePartner(p.id);
      if (selected?.id === p.id) setSelected(null);
      toast.success('Parceiro excluído');
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(user?.role === 'event_admin' ? '/eventadmin' : '/')} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Painel de Parceiros</h1>
          {event && <p className="text-xs text-neutral-500">{event.name}</p>}
        </div>
      </header>

      <div className="flex h-[calc(100vh-69px)]">
        {/* Sidebar — lista */}
        <aside className="w-72 shrink-0 bg-white border-r border-neutral-100 flex flex-col">
          <div className="p-4 border-b border-neutral-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do parceiro"
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
            {partners.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">Nenhum parceiro cadastrado</p>
            ) : (
              partners.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer group transition-colors ${
                    selected?.id === p.id ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {(p.logo_url || p.photos[0]) ? (
                    <img src={p.logo_url || p.photos[0]} className="w-8 h-8 rounded-lg object-contain bg-neutral-50 shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      <Handshake className="w-4 h-4 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className={cn('text-[10px]', selected?.id === p.id ? 'text-neutral-300' : 'text-neutral-400')}>{typeLabel(p.type)}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(p); }}
                    className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                      selected?.id === p.id ? 'hover:bg-white/10 text-white' : 'hover:bg-red-50 text-neutral-400 hover:text-red-500'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Área principal */}
        <main className="flex-1 overflow-hidden p-6">
          {selected ? (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 h-full overflow-hidden flex flex-col max-w-3xl">
              <PartnerDetail key={selected.id} partner={selected} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">
              <div className="text-center">
                <Handshake className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Selecione um parceiro para gerenciar</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
