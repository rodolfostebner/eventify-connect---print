import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, ImageIcon, Loader2 } from 'lucide-react';
import {
  getMarketingContact,
  saveMarketingContact,
  getMarketingPhotos,
  createMarketingPhoto,
  updateMarketingPhoto,
  deleteMarketingPhoto,
  reorderMarketingPhotos,
  type MarketingContact,
  type MarketingPhoto,
} from '../../services/marketingService';
import { uploadImage } from '../../services/storageService';

interface Props {
  eventId: string;
}

export function MarketingTab({ eventId }: Props) {
  const [contact, setContact] = useState<MarketingContact | null>(null);
  const [photos, setPhotos] = useState<MarketingPhoto[]>([]);
  const [loadingContact, setLoadingContact] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [savingContact, setSavingContact] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ phrase: string; text: string }>({ phrase: '', text: '' });
  const [contactForm, setContactForm] = useState({ instagram: '', phone: '', email: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    Promise.all([
      getMarketingContact(eventId).then((data) => {
        setContact(data);
        setContactForm({
          instagram: data?.instagram || '',
          phone: data?.phone || '',
          email: data?.email || '',
        });
        setLoadingContact(false);
      }),
      getMarketingPhotos(eventId).then((data) => {
        setPhotos(data);
        setLoadingPhotos(false);
      }),
    ]);
  }, [eventId]);

  async function handleSaveContact() {
    setSavingContact(true);
    try {
      await saveMarketingContact(eventId, contactForm);
      toast.success('Contato salvo com sucesso.');
    } catch {
      toast.error('Erro ao salvar contato.');
    } finally {
      setSavingContact(false);
    }
  }

  async function handleUploadPhoto(file: File) {
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file);
      const newPhoto = await createMarketingPhoto(eventId, {
        image_url: url,
        order_index: photos.length,
      });
      if (newPhoto) setPhotos((prev) => [...prev, newPhoto]);
      toast.success('Foto adicionada.');
    } catch {
      toast.error('Erro ao fazer upload da foto.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleDeletePhoto(id: string) {
    if (!confirm('Remover esta foto de marketing?')) return;
    await deleteMarketingPhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    toast.success('Foto removida.');
  }

  function startEdit(photo: MarketingPhoto) {
    setEditingPhoto(photo.id);
    setEditForm({ phrase: photo.phrase || '', text: photo.text || '' });
  }

  async function saveEdit(id: string) {
    await updateMarketingPhoto(id, {
      phrase: editForm.phrase || undefined,
      text: editForm.text || undefined,
    });
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, phrase: editForm.phrase || null, text: editForm.text || null } : p
      )
    );
    setEditingPhoto(null);
    toast.success('Foto atualizada.');
  }

  async function handleToggleActive(photo: MarketingPhoto) {
    await updateMarketingPhoto(photo.id, { active: !photo.active });
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, active: !p.active } : p)));
  }

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  async function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const reordered = [...photos];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, moved);
    const withOrder = reordered.map((p, i) => ({ ...p, order_index: i }));
    setPhotos(withOrder);
    dragItem.current = null;
    dragOverItem.current = null;
    await reorderMarketingPhotos(withOrder.map(({ id, order_index }) => ({ id, order_index })));
  }

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Seção Contato */}
      <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-neutral-800">Contato</h3>
        {loadingContact ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-neutral-400" /></div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Instagram</label>
                <input
                  value={contactForm.instagram}
                  onChange={(e) => setContactForm((f) => ({ ...f, instagram: e.target.value }))}
                  placeholder="@perfil"
                  className="mt-1 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Telefone / WhatsApp</label>
                <input
                  value={contactForm.phone}
                  onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(51) 99999-9999"
                  className="mt-1 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">E-mail</label>
                <input
                  value={contactForm.email}
                  onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="contato@evento.com"
                  className="mt-1 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveContact}
                disabled={savingContact}
                className="px-4 py-2 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 disabled:opacity-50 flex items-center gap-2"
              >
                {savingContact && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar Contato
              </button>
            </div>
          </>
        )}
      </div>

      {/* Seção Fotos */}
      <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-800">Fotos de Marketing</h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-700 disabled:opacity-50"
          >
            {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Adicionar Foto
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadPhoto(file);
              e.target.value = '';
            }}
          />
        </div>

        {loadingPhotos ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-neutral-400" /></div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-neutral-300 gap-2">
            <ImageIcon className="w-8 h-8" />
            <p className="text-xs">Nenhuma foto adicionada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                className={`flex gap-3 p-3 border rounded-xl bg-neutral-50 ${!photo.active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center cursor-grab text-neutral-300">
                  <GripVertical className="w-4 h-4" />
                </div>

                <img
                  src={photo.image_url}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  {editingPhoto === photo.id ? (
                    <div className="space-y-2">
                      <input
                        value={editForm.phrase}
                        onChange={(e) => setEditForm((f) => ({ ...f, phrase: e.target.value }))}
                        placeholder="Frase de chamada"
                        className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs"
                      />
                      <textarea
                        value={editForm.text}
                        onChange={(e) => setEditForm((f) => ({ ...f, text: e.target.value }))}
                        placeholder="Texto complementar"
                        rows={2}
                        className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(photo.id)}
                          className="px-3 py-1 bg-neutral-900 text-white text-xs font-semibold rounded-lg"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingPhoto(null)}
                          className="px-3 py-1 border border-neutral-200 text-xs rounded-lg"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer space-y-0.5"
                      onClick={() => startEdit(photo)}
                      title="Clique para editar"
                    >
                      {photo.phrase ? (
                        <p className="text-xs font-semibold text-neutral-800 truncate">{photo.phrase}</p>
                      ) : (
                        <p className="text-xs text-neutral-400 italic">Sem frase de chamada — clique para adicionar</p>
                      )}
                      {photo.text && (
                        <p className="text-xs text-neutral-500 truncate">{photo.text}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(photo)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      photo.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {photo.active ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10px] text-neutral-400">Arraste para reordenar. Clique na foto para editar frase e texto.</p>
      </div>
    </div>
  );
}
