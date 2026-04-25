import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Users, Star, Briefcase, Globe, Instagram, MessageCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData, PhotoData } from '../../../types';
import { User } from '../../../services/authService';
import { useEventPhotos } from '../hooks/useEventPhotos';
import { PhotoCard } from './PhotoCard/PhotoCard';
import { PartnerSection } from './PartnerSection';

interface PostEventViewProps {
  event: EventData;
  user: User | null;
  onLogin: () => void;
}

export const PostEventView = ({ event, user, onLogin }: PostEventViewProps) => {
  const { photos } = useEventPhotos(event.id);
  const [currentIndex, setCurrentIndex] = useState(0);

  const rankingData = useMemo(() => {
    const categories = [
      { id: '🔥', title: 'Mais Curtidas', emoji: '🔥' },
      { id: '😂', title: 'Mais Divertida', emoji: '😂' },
      { id: '❤️', title: 'Mais Fofura', emoji: '❤️' },
      { id: '🗣️', title: 'Mais Comentada', emoji: '🗣️' },
      { id: '🎸', title: 'Rockstar', emoji: '🎸' }
    ];

    const ranking = categories.map(cat => {
      let sortedPhotos = photos.filter(p => !p.is_official);
      if (cat.id === '🔥') {
        sortedPhotos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else if (cat.id === '🗣️') {
        sortedPhotos.sort((a, b) => (b.comments?.filter(c => c.status === 'approved').length || 0) - (a.comments?.filter(c => c.status === 'approved').length || 0));
      } else {
        sortedPhotos.sort((a, b) => (b.reaction_counts?.[cat.id] || 0) - (a.reaction_counts?.[cat.id] || 0));
      }

      const topPhoto = sortedPhotos[0];
      let score = 0;
      if (topPhoto) {
        if (cat.id === '🔥') score = topPhoto.likes || 0;
        else if (cat.id === '🗣️') score = topPhoto.comments?.filter(c => c.status === 'approved').length || 0;
        else score = topPhoto.reaction_counts?.[cat.id] || 0;
      }

      return { title: cat.title, emoji: cat.emoji, photo: topPhoto, score };
    }).filter(r => r.photo && r.score > 0);

    if (event?.has_official_photos) {
      const officialPhotos = photos.filter(p => p.is_official).sort((a, b) => (b.likes || 0) - (a.likes || 0));
      if (officialPhotos.length > 0 && (officialPhotos[0].likes || 0) > 0) {
        ranking.push({ title: 'Destaques Oficiais', emoji: '📸', photo: officialPhotos[0], score: officialPhotos[0].likes || 0 });
      }
    }

    return ranking;
  }, [photos, event?.has_official_photos]);

  useEffect(() => {
    if (rankingData.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rankingData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [rankingData.length]);

  const currentHighlight = rankingData[currentIndex];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12 space-y-12 md:space-y-24">
      <div className="py-16 md:py-32 rounded-2xl border border-neutral-100 bg-white shadow-xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-neutral-900/5 rounded-full mt-6 md:mt-10" />
        <Trophy className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-10 text-yellow-500 drop-shadow-md" />
        <h2 className="text-4xl md:text-7xl font-black tracking-tighter">Evento Encerrado</h2>
        <p className="text-neutral-500 mt-6 md:mt-10 max-w-xs md:max-w-2xl mx-auto font-medium leading-relaxed px-4 text-sm md:text-lg">
          {event.post_event_message || 'Obrigado por participar! O evento foi um sucesso e as fotos já estão disponíveis.'}
        </p>
      </div>

      {rankingData.length > 0 && (
        <section className="bg-white p-6 md:p-16 rounded-2xl border border-neutral-50 shadow-xl text-left overflow-hidden relative">
          <h2 className="text-2xl md:text-4xl font-black mb-12 md:mb-20 flex items-center gap-4">
             Destaques do Evento
          </h2>
          
          <div className="relative aspect-[4/5] md:aspect-video w-full overflow-hidden rounded-xl bg-neutral-50 shadow-inner">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 p-6 md:p-12"
              >
                <div className="flex flex-col justify-center gap-8 md:gap-10">
                  <div className="flex items-center gap-6">
                    <span className="text-6xl md:text-8xl">{currentHighlight.emoji}</span>
                    <div>
                      <h3 className="font-black text-[10px] md:text-xs uppercase tracking-[0.4em] text-neutral-400 mb-2">{currentHighlight.title}</h3>
                      <p className="text-4xl md:text-6xl font-black text-neutral-900 leading-none">Score: {currentHighlight.score}</p>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-neutral-500 md:text-lg font-medium leading-relaxed max-w-md">
                      Esta foto se destacou na categoria {currentHighlight.title.toLowerCase()} com uma pontuação incrível de {currentHighlight.score} interações!
                    </p>
                  </div>
                </div>
                
                <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 md:border-[12px] border-white bg-white group hover:scale-[1.02] transition-transform duration-500">
                  <PhotoCard photo={currentHighlight.photo!} user={user} event={event} onLogin={onLogin} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-3 mt-10 md:mt-16">
            {rankingData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentIndex === idx ? "w-12 bg-neutral-900 shadow-md" : "w-2 bg-neutral-200 hover:bg-neutral-300"
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {event.summary_file_url && (
        <a
          href={event.summary_file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block w-full py-10 md:py-14 bg-neutral-900 text-white rounded-2xl font-black text-xl md:text-3xl shadow-2xl active:scale-[0.98] transition-all text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="relative">Baixar Resumo do Evento 🎁</span>
        </a>
      )}

      {/* Expositores e Patrocinadores */}
      <div className="space-y-16 md:space-y-32 text-left pt-8">
        <PartnerSection 
          title="Expositores" 
          items={event.exhibitors || []} 
          icon={<Users className="w-5 h-5" />} 
          showMessages={true}
        />
        <PartnerSection 
          title="Patrocinadores" 
          items={event.sponsors || []} 
          icon={<Star className="w-5 h-5" />} 
          showMessages={true}
        />
        <PartnerSection 
          title="Serviços" 
          items={event.services || []} 
          icon={<Briefcase className="w-5 h-5" />} 
          showMessages={true}
        />
      </div>
    </div>
  );
};
