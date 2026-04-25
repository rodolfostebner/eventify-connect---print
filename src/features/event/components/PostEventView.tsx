import React, { useMemo } from 'react';
import { Trophy, Users, Star, Briefcase, Globe, Instagram, MessageCircle } from 'lucide-react';
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

  const rankingData = useMemo(() => {
    const categories = [
      { id: 'likes', title: 'Mais Curtida', emoji: '❤️' },
      { id: '😂', title: 'Mais Divertida', emoji: '😂' },
      { id: '✨', title: 'Momento Especial', emoji: '✨' },
      { id: '💬', title: 'Mais Comentada', emoji: '💬' },
      { id: '🎸', title: 'Rock Star', emoji: '🎸' },
      { id: '⭐', title: 'Queridinha', emoji: '⭐' }
    ];

    const ranking = categories.map(cat => {
      let sortedPhotos = photos.filter(p => !p.is_official);
      if (cat.id === 'likes') {
        sortedPhotos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else if (cat.id === '💬') {
        sortedPhotos.sort((a, b) => (b.comments?.filter(c => c.status === 'approved').length || 0) - (a.comments?.filter(c => c.status === 'approved').length || 0));
      } else {
        sortedPhotos.sort((a, b) => (b.reactions?.[cat.id] || 0) - (a.reactions?.[cat.id] || 0));
      }

      const topPhoto = sortedPhotos[0];
      let score = 0;
      if (topPhoto) {
        if (cat.id === 'likes') score = topPhoto.likes || 0;
        else if (cat.id === '💬') score = topPhoto.comments?.filter(c => c.status === 'approved').length || 0;
        else score = topPhoto.reactions?.[cat.id] || 0;
      }

      return { title: cat.title, emoji: cat.emoji, photo: topPhoto, score };
    }).filter(r => r.photo && r.score > 0);

    if (event?.has_official_photos) {
      const officialPhotos = photos.filter(p => p.is_official).sort((a, b) => (b.likes || 0) - (a.likes || 0));
      if (officialPhotos.length > 0 && (officialPhotos[0].likes || 0) > 0) {
        ranking.push({ title: 'Melhor Foto Oficial', emoji: '📸', photo: officialPhotos[0], score: officialPhotos[0].likes || 0 });
      }
    }

    return ranking;
  }, [photos, event?.has_official_photos]);

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
        <section className="bg-white p-8 rounded-[48px] border border-neutral-50 shadow-2xl text-left">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
             Destaques do Evento
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x custom-scrollbar -mx-2 px-2">
            {rankingData.map((item, idx) => (
              <div key={idx} className="min-w-[300px] snap-center bg-neutral-50/50 rounded-[32px] p-6 border border-neutral-100 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{item.emoji}</span>
                  <div>
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-neutral-400">{item.title}</h3>
                    <p className="text-xl font-black text-neutral-900">Score: {item.score}</p>
                  </div>
                </div>
                <PhotoCard photo={item.photo!} user={user} event={event} onLogin={onLogin} />
              </div>
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
