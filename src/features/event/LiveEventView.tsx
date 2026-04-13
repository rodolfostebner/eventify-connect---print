import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Camera, Loader2, Star, Image as ImageIcon, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import type { EventData, PhotoData } from '../../types';
import { User } from '../../services/authService';
import { usePosts } from '../../hooks/usePosts';
import { createPost } from '../../services/posts';
import { PhotoCard } from './components/PhotoCard';

interface LiveEventViewProps {
  event: EventData;
  user: User | null;
  onLogin: () => void;
  isSelectingForPrint: boolean;
  selectedPrintPhotos: string[];
  togglePhotoSelection: (id: string) => void;
}

export function LiveEventView({ event, user, onLogin, isSelectingForPrint, selectedPrintPhotos, togglePhotoSelection }: LiveEventViewProps) {
  const { posts } = usePosts(event?.id || '');
  const photos = posts || [];
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (event.interactions_paused) {
      toast.error('Interações estão pausadas no momento.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file || !user) return;

    handleDirectUpload(file);
  };

  const handleDirectUpload = async (file: File) => {
    if (event.interactions_paused) return;
    const toastId = toast.loading('Processando sua foto...');
    setUploading(true);

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo selecionado não é uma imagem.');
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000;
            const MAX_HEIGHT = 1000;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(dataUrl);
          };
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await createPost({
        eventId: event.id,
        url: base64,
        user_name: user.displayName || 'Anônimo',
        firebase_uid: user.uid,
        status: 'pending'
      });

      toast.success('Foto enviada!', { id: toastId });
    } catch (err: any) {
      console.error('Erro no upload:', err);
      toast.error(err.message || 'Erro ao enviar foto.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const categoryGroups = useMemo(() => {
    const approved = photos.filter(p => p.status === 'approved' && !p.is_official);
    const official = photos.filter(p => p.status === 'approved' && p.is_official);
    if (approved.length === 0 && official.length === 0) return [];

    const categories: { title: string; photos: PhotoData[] }[] = [];

    const mostLiked = [...approved]
      .filter(p => (p.likes || 0) > 0)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);
    if (mostLiked.length > 0) {
      categories.push({ title: 'Mais Curtida ❤️', photos: mostLiked });
    }

    const mostFunny = [...approved]
      .filter(p => (p.reactions?.['😂'] || 0) > 0)
      .sort((a, b) => (b.reactions?.['😂'] || 0) - (a.reactions?.['😂'] || 0))
      .slice(0, 5);
    if (mostFunny.length > 0) {
      categories.push({ title: 'Mais Divertida 😂', photos: mostFunny });
    }

    const specialMoment = [...approved]
      .filter(p => (p.reactions?.['✨'] || 0) > 0)
      .sort((a, b) => (b.reactions?.['✨'] || 0) - (a.reactions?.['✨'] || 0))
      .slice(0, 5);
    if (specialMoment.length > 0) {
      categories.push({ title: 'Momento Especial ✨', photos: specialMoment });
    }

    const mostCommented = [...approved]
      .filter(p => (p.comments?.filter(c => c.status === 'approved' && !(c as any).deleted).length || 0) > 0)
      .sort((a, b) => (b.comments?.filter(c => c.status === 'approved' && !(c as any).deleted).length || 0) - (a.comments?.filter(c => c.status === 'approved' && !(c as any).deleted).length || 0))
      .slice(0, 5);
    if (mostCommented.length > 0) {
      categories.push({ title: 'Mais Comentada 💬', photos: mostCommented });
    }

    const rockStar = [...approved]
      .filter(p => (p.reactions?.['🎸'] || 0) > 0)
      .sort((a, b) => (b.reactions?.['🎸'] || 0) - (a.reactions?.['🎸'] || 0))
      .slice(0, 5);
    if (rockStar.length > 0) {
      categories.push({ title: 'Rock Star 🎸', photos: rockStar });
    }

    const favorite = [...approved]
      .filter(p => {
        const total = Object.values(p.reactions || {}).reduce((acc, val) => acc + val, 0);
        return total > 0;
      })
      .sort((a, b) => {
        const totalA = Object.values(a.reactions || {}).reduce((acc, val) => acc + val, 0);
        const totalB = Object.values(b.reactions || {}).reduce((acc, val) => acc + val, 0);
        return totalB - totalA;
      })
      .slice(0, 5);
    if (favorite.length > 0) {
      categories.push({ title: 'Queridinha ⭐', photos: favorite });
    }

    if (event.has_official_photos && official.length > 0) {
      const bestOfficial = [...official]
        .filter(p => (p.likes || 0) > 0)
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 5);
      if (bestOfficial.length > 0) {
        categories.push({ title: 'Melhor Foto Oficial 📸', photos: bestOfficial });
      }
    }

    return categories;
  }, [photos, event.has_official_photos]);

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (categoryGroups.length === 0) return;

    if (currentGroupIndex >= categoryGroups.length) {
      setCurrentGroupIndex(0);
      setCurrentPhotoIndex(0);
      return;
    }
    const currentGroup = categoryGroups[currentGroupIndex];
    if (currentPhotoIndex >= currentGroup.photos.length) {
      setCurrentPhotoIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevPhoto) => {
        const group = categoryGroups[currentGroupIndex];
        if (!group || !group.photos) return 0;
        if (prevPhoto + 1 < group.photos.length) {
          return prevPhoto + 1;
        } else {
          setCurrentGroupIndex((prevGroup) => (prevGroup + 1) % categoryGroups.length);
          return 0;
        }
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [categoryGroups, currentGroupIndex, currentPhotoIndex]);

  const officialPhotos = photos.filter(p => p.status === 'approved' && p.is_official);
  const galleryPhotos = photos.filter(p => !p.is_official);

  return (
    <div className="p-4 space-y-12">
      {/* Featured Photos Slideshow */}
      {categoryGroups.length > 0 && currentGroupIndex < categoryGroups.length && currentPhotoIndex < categoryGroups[currentGroupIndex].photos.length && (
        <section className="relative px-2">
          <div className="text-center mb-10">
            <h2
              className="text-3xl md:text-5xl font-black inline-block relative tracking-tighter uppercase"
              style={{
                color: event.primary_color || '#171717',
                textShadow: `2px 2px 0px ${event.secondary_color || '#e5e5e5'}80`
              }}
            >
              Destaques do Momento
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1/2 h-1.5 rounded-full opacity-80"
                style={{ backgroundColor: event.secondary_color || '#e5e5e5' }}
              />
            </h2>
          </div>

          <div className="aspect-video bg-white rounded-[32px] overflow-hidden shadow-2xl border-[8px] border-white relative group">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentGroupIndex}-${currentPhotoIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <img
                  src={categoryGroups[currentGroupIndex].photos[currentPhotoIndex].url}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest">
                      {categoryGroups[currentGroupIndex].title}
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">
                    {categoryGroups[currentGroupIndex].photos[currentPhotoIndex].user_name}
                  </h3>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {categoryGroups[currentGroupIndex].photos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPhotoIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentPhotoIndex === idx ? "w-6 bg-neutral-900" : "bg-neutral-300"
                )}
              />
            ))}
          </div>
        </section>
      )}

      {/* Official Photos Section */}
      {event.has_official_photos && officialPhotos.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> Fotos Oficiais
            </h2>
            <span className="text-[10px] font-bold uppercase text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">Equipe</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x custom-scrollbar">
            {officialPhotos.map((photo) => (
              <div key={photo.id} className="min-w-[280px] snap-center">
                <PhotoCard
                  photo={photo}
                  user={user}
                  event={event}
                  onLogin={onLogin}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
          <Camera className="w-4 h-4" /> Feed do Evento
        </h2>
        <span className="text-xs text-neutral-400">{galleryPhotos.length} fotos</span>
      </div>

      {galleryPhotos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-neutral-200 rounded-3xl">
          <ImageIcon className="w-12 h-12 mx-auto text-neutral-200 mb-4" />
          <p className="text-neutral-400">Nenhuma foto ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {galleryPhotos.map((photo) => (
              <div key={photo.id} className="relative">
                <PhotoCard photo={photo} user={user} event={event} onLogin={onLogin} />
                {isSelectingForPrint && (
                  <button
                    onClick={() => togglePhotoSelection(photo.id)}
                    className={cn(
                      "absolute top-2 right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all",
                      selectedPrintPhotos.includes(photo.id)
                        ? "bg-green-500 border-green-500 text-white scale-110"
                        : "bg-white/80 backdrop-blur-sm border-neutral-300 text-transparent"
                    )}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Action Button */}
      <input
        type="file"
        accept="image/*"
        capture={event.upload_source === 'camera' ? 'environment' : undefined}
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {!event.interactions_paused && (
          <button
            onClick={() => user ? fileInputRef.current?.click() : onLogin()}
            disabled={uploading}
            className="w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: event.primary_color || '#171717' }}
          >
            {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
          </button>
        )}
      </div>

      {!user && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-24 left-4 right-4 bg-white border border-neutral-200 p-4 rounded-2xl shadow-2xl text-center z-[60]"
        >
          <p className="text-sm font-bold text-neutral-900 mb-3">Quer postar fotos e interagir?</p>
          <button
            onClick={onLogin}
            className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
            Entrar com Google
          </button>
          <p className="text-[10px] text-neutral-400 mt-2">Você pode continuar visualizando a galeria sem login.</p>
        </motion.div>
      )}
    </div>
  );
}
