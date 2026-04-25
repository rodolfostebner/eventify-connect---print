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
    <div className="p-6 text-center space-y-12">
      <div className="py-16 rounded-[40px] border border-neutral-100 bg-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-neutral-900/5 rounded-full mt-4" />
        <Trophy className="w-24 h-24 mx-auto mb-8 text-yellow-500 drop-shadow-lg" />
        <h2 className="text-4xl font-black tracking-tighter">Evento Encerrado</h2>
        <p className="text-neutral-500 mt-4 max-w-xs mx-auto font-medium leading-relaxed">
          {event.post_event_message || 'Obrigado por participar! O evento foi um sucesso e as fotos já estão disponíveis.'}
        </p>
      </div>

      {/* Removido botão sem função */}

      {rankingData.length > 0 && (
        <section className="bg-white p-8 rounded-[48px] border border-neutral-50 shadow-2xl text-left overflow-hidden relative">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
             Destaques do Evento
          </h2>
          
          <div className="relative aspect-[4/5] md:aspect-video w-full overflow-hidden rounded-[32px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-8 bg-neutral-50/50 p-6"
              >
                <div className="flex flex-col justify-center gap-6">
                  <div className="flex items-center gap-4">
                    <span className="text-6xl">{currentHighlight.emoji}</span>
                    <div>
                      <h3 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400">{currentHighlight.title}</h3>
                      <p className="text-4xl font-black text-neutral-900">Score: {currentHighlight.score}</p>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-neutral-500 font-medium">
                      Esta foto se destacou na categoria {currentHighlight.title.toLowerCase()} com uma pontuação incrível de {currentHighlight.score} interações!
                    </p>
                  </div>
                </div>
                
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                  <PhotoCard photo={currentHighlight.photo!} user={user} event={event} onLogin={onLogin} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {rankingData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-8 bg-neutral-900" : "w-1.5 bg-neutral-200"
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
          className="block w-full py-6 bg-white border-2 border-neutral-100 text-neutral-900 rounded-3xl font-black text-lg shadow-xl active:scale-[0.98] transition-all text-center hover:bg-neutral-50"
        >
          Baixar Resumo do Evento 🎁
        </a>
      )}

      {/* Expositores e Patrocinadores */}
      <div className="space-y-16 text-left pt-8">
        <PartnerSection 
          title="Expositores" 
          items={event.exhibitors || []} 
          icon={<Users className="w-4 h-4" />} 
          showMessages={true}
        />
        <PartnerSection 
          title="Patrocinadores" 
          items={event.sponsors || []} 
          icon={<Star className="w-4 h-4" />} 
          showMessages={true}
        />
        <PartnerSection 
          title="Serviços" 
          items={event.services || []} 
          icon={<Briefcase className="w-4 h-4" />} 
          showMessages={true}
        />
      </div>
    </div>
  );
};
