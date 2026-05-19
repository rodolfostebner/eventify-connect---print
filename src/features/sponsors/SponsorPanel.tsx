import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Upload, X, Star,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Sponsor, EventData } from '../../types';
import {
  subscribeToSponsors, createSponsor, updateSponsor, deleteSponsor,
} from '../../services/sponsorService';
import { subscribeToEvent } from '../../services/eventService';
import { uploadImage } from '../../services/storageService';

const MAX_PHOTOS = 3;

// ─── Photo Carousel (preview no detalhe) ──────────────────────────────────────

function PhotoCarousel({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => { setIndex(0); }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <div className="relative mb-4">
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

// ─── Sponsor Detail ────────────────────────────────────────────────────────────

function SponsorDetail({ sponsor, onUpdated }: { sponsor: Sponsor; onUpdated: () => void }) {
  const [form, setForm] = useState({
    name: sponsor.name,
    description: sponsor.description || '',
    instagram_url: sponsor.instagram_url || '',
    whatsapp: sponsor.whatsapp || '',
    website_url: sponsor.website_url || '',
  });
  const [photos, setPhotos] = useState<string[]>(sponsor.photos);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: sponsor.name,
      description: sponsor.description || '',
      instagram_url: sponsor.instagram_url || '',
      whatsapp: sponsor.whatsapp || '',
      website_url: sponsor.website_url || '',
    });
    setPhotos(sponsor.photos);
  }, [sponsor.id]);

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

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Nome obrigatório');
    setSaving(true);
    try {
      await updateSponsor(sponsor.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        photos,
        instagram_url: form.instagram_url.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        website_url: form.website_url.trim() || null,
      });
      toast.success('Patrocinador atualizado!');
      onUpdated();
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header do detalhe */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 mb-4">
        {photos[0] ? (
          <img src={photos[0]} className="w-12 h-12 rounded-xl object-cover bg-neutral-50 border border-neutral-100 shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-neutral-400" />
          </div>
        )}
        <div>
          <h2 className="font-bold text-neutral-900">{sponsor.name}</h2>
          <p className="text-xs text-neutral-400">Patrocinador</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {/* Preview carrossel */}
        <PhotoCarousel photos={photos} />

        {/* Upload de fotos */}
        <div>
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-2">
            Fotos ({photos.length}/{MAX_PHOTOS})
          </label>
          <div className="flex gap-2 flex-wrap">
            {photos.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-200">
                <img src={url} className="w-full h-full object-cover" />
                <button
                  onClick={() => setPhotos(p => p.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white"
                >
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
    </div>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────────

export default function SponsorPanel() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selected, setSelected] = useState<Sponsor | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!slug) return;
    return subscribeToEvent(slug, setEvent);
  }, [slug]);

  useEffect(() => {
    if (!event?.id) return;
    return subscribeToSponsors(event.id, list => {
      setSponsors(list);
      if (selected) {
        const updated = list.find(s => s.id === selected.id);
        if (updated) setSelected(updated);
      }
    });
  }, [event?.id]);

  const handleCreate = async () => {
    if (!newName.trim() || !event?.id) return;
    setCreating(true);
    try {
      const created = await createSponsor({
        event_id: event.id,
        name: newName.trim(),
        description: null,
        photos: [],
        instagram_url: null,
        whatsapp: null,
        website_url: null,
        order_index: sponsors.length,
        active: true,
      });
      setNewName('');
      setSelected(created);
      toast.success('Patrocinador criado!');
    } catch {
      toast.error('Erro ao criar patrocinador');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (s: Sponsor) => {
    if (!confirm(`Excluir "${s.name}"?`)) return;
    try {
      await deleteSponsor(s.id);
      if (selected?.id === s.id) setSelected(null);
      toast.success('Patrocinador excluído');
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
          <h1 className="text-lg font-bold text-neutral-900">Painel de Patrocinadores</h1>
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
                placeholder="Nome do patrocinador"
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
            {sponsors.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">Nenhum patrocinador cadastrado</p>
            ) : (
              sponsors.map(s => (
                <div
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer group transition-colors ${
                    selected?.id === s.id
                      ? 'bg-neutral-900 text-white'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {s.photos[0] ? (
                    <img src={s.photos[0]} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.name}</p>
                    <p className="text-[10px] text-neutral-400">
                      {s.photos.length} foto{s.photos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(s); }}
                    className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                      selected?.id === s.id
                        ? 'hover:bg-white/10 text-white'
                        : 'hover:bg-red-50 text-neutral-400 hover:text-red-500'
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
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 h-full overflow-hidden flex flex-col">
              <SponsorDetail
                key={selected.id}
                sponsor={selected}
                onUpdated={() => {}}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">
              <div className="text-center">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Selecione um patrocinador para gerenciar</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
