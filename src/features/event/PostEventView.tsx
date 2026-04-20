import React, { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import type { EventData } from '../../types';
import { User } from '../../services/authService';
import { usePosts } from '../../hooks/usePosts';
import { PhotoCard } from './components/PhotoCard/PhotoCard';

export function PostEventView({ event, user, onLogin }: { event: EventData, user: User | null, onLogin: () => void }) {
  const { posts: photos } = usePosts(event?.id || '');

  const rankingData = useMemo(() => {
    const categories = [
      { id: 'likes', title: 'Mais Curtida', emoji: '❤️' },
      { id: '😂', title: 'Mais Divertida', emoji: '😂' },
      { id: '✨', title: 'Momento Especial', emoji: '✨' },
      { id: '💬', title: 'Mais Comentada', emoji: '💬' },
      { id: '🎸', title: 'Rock Star', emoji: '🎸' },
      { id: '⭐', title: 'Queridinha', emoji: '⭐' }
    ];

    return categories.map(cat => {
      let sorted = [...(photos || [])];

      if (cat.id === 'likes') {
        sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else if (cat.id === '💬') {
        sorted.sort((a, b) =>
          (b.comments?.filter(c => c.status === 'approved' && !(c as any).deleted).length || 0)
          -
          (a.comments?.filter(c => c.status === 'approved' && !(c as any).deleted).length || 0)
        );
      } else {
        sorted.sort((a, b) =>
          (b.reactions?.[cat.id] || 0) - (a.reactions?.[cat.id] || 0)
        );
      }

      const top = sorted.length > 0 ? sorted[0] : null;

      return top
        ? {
          title: cat.title,
          emoji: cat.emoji,
          photo: top,
        }
        : null;
    }).filter(Boolean);
  }, [photos]);

  return (
    <div className="p-6 text-center space-y-12">
      <div className="py-12 rounded-[40px] border border-neutral-100 bg-white shadow-xl">
        <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
        <h2 className="text-3xl font-black">Evento Encerrado</h2>
        <p className="text-neutral-500 mt-3 max-w-xs mx-auto">
          Obrigado por participar!
        </p>
      </div>

      {rankingData.length > 0 && (
        <section className="bg-white p-6 rounded-[40px] border border-neutral-100 shadow-xl text-left">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Ranking
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
            {rankingData.map((item: any, idx) => (
              <div key={idx} className="min-w-[260px] snap-center">
                <div className="text-sm font-bold mb-2">
                  {item.emoji} {item.title}
                </div>

                <PhotoCard
                  photo={item.photo}
                  user={user}
                  event={event}
                  onLogin={onLogin}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
