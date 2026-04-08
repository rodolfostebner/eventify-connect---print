import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Camera, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import type { EventData, PhotoData } from '../types';
import { subscribeToEvent } from '../services/eventService';
import { subscribeToApprovedPhotos } from '../services/photoService';

export default function TVView() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<{ title: string; emoji: string; photos: PhotoData[] }[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showRanking, setShowRanking] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (event?.tv_show_ranking) {
      if (!showRanking && countdown === null) {
        setCountdown(10);
      }
    } else {
      setShowRanking(false);
      setCountdown(null);
    }
  }, [event?.tv_show_ranking]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowRanking(true);
      setCountdown(null);
    }
  }, [countdown]);

  // Subscribe to event by slug
  useEffect(() => {
    if (!slug) return;
    return subscribeToEvent(
      slug,
      (ev) => { if (ev) setEvent(ev); },
      (error) => console.error('Error fetching event in TVView:', error),
    );
  }, [slug]);

  // Subscribe to approved photos once event is loaded
  useEffect(() => {
    if (!event?.id) return;

    return subscribeToApprovedPhotos(
      event.id,
      (allPhotos) => {
        setPhotos(allPhotos);

        const categories = [
          { id: 'likes', title: 'Mais Curtida', emoji: '❤️' },
          { id: '😂', title: 'Mais Divertida', emoji: '😂' },
          { id: '✨', title: 'Momento Especial', emoji: '✨' },
          { id: '💬', title: 'Mais Comentada', emoji: '💬' },
          { id: '🎸', title: 'Rock Star', emoji: '🎸' },
          { id: '⭐', title: 'Queridinha', emoji: '⭐' },
        ];

        const groups = categories.map((cat) => {
          let sortedPhotos = allPhotos.filter((p) => !p.is_official);
          if (cat.id === 'likes') {
            sortedPhotos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
          } else if (cat.id === '💬') {
            sortedPhotos.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
          } else {
            sortedPhotos.sort((a, b) => (b.reactions?.[cat.id] || 0) - (a.reactions?.[cat.id] || 0));
          }

          const top5 = sortedPhotos
            .filter((p) => {
              if (cat.id === 'likes') return (p.likes || 0) > 0;
              if (cat.id === '💬') return (p.comments?.length || 0) > 0;
              return (p.reactions?.[cat.id] || 0) > 0;
            })
            .slice(0, 5);

          return { title: cat.title, emoji: cat.emoji, photos: top5 };
        }).filter((g) => g.photos.length > 0);

        // Add official photos if enabled
        if (event.has_official_photos) {
          const officialPhotos = allPhotos
            .filter((p) => p.is_official)
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 5);
          if (officialPhotos.length > 0) {
            groups.push({ title: 'Melhor Foto Oficial', emoji: '📸', photos: officialPhotos });
          }
        }

        setCategoryGroups(groups);
      },
      (error) => console.error('Error fetching photos in TVView:', error),
    );
  }, [event?.id, event?.has_official_photos]);

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

  const getBackgroundStyle = () => {
    if (!event) return {};
    const type = event.tv_bg_type || event.bg_type || 'color';
    const value = event.tv_bg_value || event.bg_value || '#0a0a0a';

    if (type === 'color') return { backgroundColor: value };
    if (type === 'gradient') {
      const from = event.tv_bg_gradient_from || event.bg_gradient_from || '#0a0a0a';
      const to = event.tv_bg_gradient_to || event.bg_gradient_to || '#1a1a1a';
      return { background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` };
    }
    if (type === 'pattern') {
      const bg = event.tv_bg_pattern_bg || event.bg_pattern_bg || '#0a0a0a';
      const fg = event.tv_bg_pattern_fg || event.bg_pattern_fg || '#1a1a1a';

      switch (value) {
        case 'dots':
          return { backgroundColor: bg, backgroundImage: `radial-gradient(${fg} 1px, transparent 1px)`, backgroundSize: '20px 20px' };
        case 'grid':
          return { backgroundColor: bg, backgroundImage: `linear-gradient(${fg} 1px, transparent 1px), linear-gradient(90deg, ${fg} 1px, transparent 1px)`, backgroundSize: '40px 40px' };
        case 'diagonal':
          return { backgroundColor: bg, backgroundImage: `linear-gradient(45deg, ${fg} 25%, transparent 25%, transparent 50%, ${fg} 50%, ${fg} 75%, transparent 75%, transparent)`, backgroundSize: '20px 20px' };
        case 'waves':
          return { backgroundColor: bg, backgroundImage: `radial-gradient(circle at 100% 50%, ${bg} 20%, ${fg} 21%, ${fg} 34%, ${bg} 35%, ${bg} 100%), radial-gradient(circle at 0% 50%, ${bg} 20%, ${fg} 21%, ${fg} 34%, ${bg} 35%, ${bg} 100%)`, backgroundSize: '40px 40px' };
        case 'circuit':
          return { backgroundColor: bg, backgroundImage: `linear-gradient(90deg, ${fg} 1px, transparent 1px), linear-gradient(${fg} 1px, transparent 1px)`, backgroundSize: '100px 100px', opacity: 0.1 };
        case 'hexagons':
          return { backgroundColor: bg, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath fill='${encodeURIComponent(fg)}' fill-opacity='0.4' d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9l11-6.35 11 6.35v12.7l-11 6.35L3 30.6V17.9z'/%3E%3C/svg%3E")` };
        default:
          return { backgroundColor: bg };
      }
    }
    return { backgroundColor: '#0a0a0a' };
  };

  if (!event) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold">Carregando Telão...</div>;

  if (countdown !== null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={getBackgroundStyle()}>
        <motion.div
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          className="text-[20rem] font-black text-white leading-none"
          style={{ textShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
        >
          {countdown}
        </motion.div>
        <p className="text-4xl font-bold text-white/50 uppercase tracking-widest mt-8">
          Preparando Ranking Final...
        </p>
      </div>
    );
  }

  if (showRanking) {
    const topPhotos = categoryGroups.map((g) => ({ ...g, photo: g.photos[0] })).filter((g) => g.photo);
    return (
      <div className="min-h-screen flex flex-col p-12" style={getBackgroundStyle()}>
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            {event.logo_url && (
              <div className="p-4 bg-white rounded-2xl shadow-2xl">
                <img src={event.logo_url} alt="Logo" className="h-24 w-auto object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
            <div>
              <h1 className="text-6xl font-black tracking-tighter uppercase text-white" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                Ranking Final
              </h1>
              <p className="text-2xl font-bold text-white/70 uppercase tracking-widest mt-2">
                Os grandes destaques do evento
              </p>
            </div>
          </div>
          {event.app_logo && (
            <div className="p-4 bg-white rounded-2xl shadow-2xl">
              <img src={event.app_logo} alt="App Logo" className="h-24 w-auto object-contain" referrerPolicy="no-referrer" />
            </div>
          )}
        </header>

        <main className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-8">
          {topPhotos.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="bg-black/40 backdrop-blur-xl rounded-[40px] p-8 border border-white/10 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/10 to-transparent" />
              <span className="text-6xl mb-6 relative z-10">{item.emoji}</span>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-8 relative z-10">
                {item.title}
              </h3>
              <div className="w-full aspect-square rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl relative z-10 mb-6">
                <img src={item.photo.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-1">Vencedor(a)</p>
                <p className="text-3xl font-black text-white">{item.photo.user_name || 'Anônimo'}</p>
              </div>
            </motion.div>
          ))}
        </main>
      </div>
    );
  }

  const currentGroup = categoryGroups[currentGroupIndex];
  const currentPhoto = currentGroup?.photos[currentPhotoIndex];

  return (
    <div className="min-h-screen text-white overflow-hidden flex flex-col" style={getBackgroundStyle()}>
      {/* Header */}
      <header className="px-8 py-4 flex justify-between items-center border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {event.logo_url && (
            <div className="p-2 bg-white rounded-xl shadow-lg">
              <img src={event.logo_url} alt="Logo" className="max-h-32 w-auto object-contain" referrerPolicy="no-referrer" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none" style={{ color: event.tv_primary_color || '#ffffff' }}>{event.name}</h1>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Feed Interativo ao Vivo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-neutral-500 uppercase">Envie sua foto!</p>
            <p className="text-lg font-black text-white">/{event.slug}</p>
          </div>
          {event.app_logo ? (
            <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-lg flex items-center justify-center">
              <img src={event.app_logo} alt="App" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: event.tv_primary_color || '#ffffff' }}>
              <Camera className="w-5 h-5" style={{ color: event.tv_secondary_color || '#000000' }} />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden">
        {/* Slideshow */}
        <div className="col-span-9 bg-black/20 rounded-[40px] overflow-hidden relative shadow-2xl border border-white/5">
          <AnimatePresence mode="wait">
            {currentPhoto ? (
              <motion.div
                key={`${currentGroup.title}-${currentPhoto.id}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex items-center justify-center p-8"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={currentPhoto.url}
                    className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border-8 border-white/10"
                    referrerPolicy="no-referrer"
                  />

                  <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                    <span className="text-3xl">{currentGroup.emoji}</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Categoria</p>
                      <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: event.tv_primary_color || '#ffffff' }}>{currentGroup.title}</h3>
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/60 backdrop-blur-md rounded-3xl border border-white/10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/60">
                          {currentPhoto.user_name?.substring(0, 2).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Foto enviada por</p>
                          <h2 className="text-2xl font-black tracking-tighter">{currentPhoto.user_name}</h2>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        {Object.entries(currentPhoto.reactions || { '❤️': currentPhoto.likes }).map(([emoji, count]) => (
                          <div key={emoji} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl">
                            <span className="text-2xl">{emoji}</span>
                            <span className="text-xl font-black">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-700">
                <Camera className="w-24 h-24 animate-pulse" />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Ranking sidebar */}
        <div className="col-span-3 flex flex-col gap-8 overflow-hidden">
          <section className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6" style={{ color: event.tv_primary_color || '#EAB308' }} />
              <h2 className="text-xl font-black uppercase tracking-tight">Ranking</h2>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {currentGroup?.photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={cn(
                    'p-3 rounded-2xl border transition-all duration-500 flex gap-3 items-center',
                    index === currentPhotoIndex
                      ? 'bg-white border-white shadow-xl scale-105'
                      : 'bg-black/20 border-white/5',
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm',
                    index === currentPhotoIndex ? 'bg-neutral-100 text-neutral-900' : 'bg-white/10 text-white',
                  )}>
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <img src={photo.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-bold text-sm truncate', index === currentPhotoIndex ? 'text-neutral-900' : 'text-white')}>
                      {photo.user_name}
                    </p>
                    <div className="flex items-center gap-1.5" style={{ color: event.tv_primary_color || '#ef4444' }}>
                      <Heart className="w-3 h-3 fill-current" />
                      <span className="font-black text-xs">{photo.likes}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!currentGroup || currentGroup.photos.length === 0) && (
                <p className="text-neutral-600 font-bold uppercase tracking-widest text-center py-12 text-xs">Nenhuma interação ainda</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
