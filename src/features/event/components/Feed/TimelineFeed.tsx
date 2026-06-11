import React from 'react';
import { Image as ImageIcon, Check } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { cn } from '../../../../lib/utils';
import type { EventData, PhotoData, AppUser, Partner } from '../../../../types';
import { TimelinePostCard } from './TimelinePostCard';
import { SponsorFeedCard } from './SponsorFeedCard';
import { useInterleavedFeed } from '../../hooks/useInterleavedFeed';

interface TimelineFeedProps {
  event: EventData;
  user: AppUser | null;
  onLogin: () => void;
  officialPhotos: PhotoData[];
  galleryPhotos: PhotoData[];
  partners: Partner[];
  isSelectingForPrint: boolean;
  selectedPrintPhotos: string[];
  togglePhotoSelection: (id: string) => void;
}

/** Intervalo de fotos entre cada card de patrocinador no feed vertical */
const TIMELINE_SPONSOR_INTERVAL = 6;

export const TimelineFeed = ({
  event,
  user,
  onLogin,
  officialPhotos,
  galleryPhotos,
  partners,
  isSelectingForPrint,
  selectedPrintPhotos,
  togglePhotoSelection,
}: TimelineFeedProps) => {
  // Combina fotos oficiais e galeria em ordem cronológica
  const allPhotos = React.useMemo(() => {
    const combined = [...galleryPhotos];
    if (event.has_official_photos) {
      combined.push(...officialPhotos);
    }
    // Ordena pela data de criação decrescente (mais novas no topo)
    return combined.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [galleryPhotos, officialPhotos, event.has_official_photos]);

  // Feed intercalado com cards de parceiros
  const feedItems = useInterleavedFeed(allPhotos, partners, TIMELINE_SPONSOR_INTERVAL);

  return (
    <div className="space-y-6 max-w-xl mx-auto px-1 mt-6">
      {allPhotos.length === 0 ? (
        <div className="text-center py-24 bg-neutral-50/50 border-2 border-dashed border-neutral-100 rounded-2xl">
          <ImageIcon className="w-12 h-12 mx-auto text-neutral-200 mb-4" />
          <p className="text-neutral-400 text-sm font-bold">
            Nenhuma foto ainda.<br/>
            <span className="text-[10px] font-normal uppercase tracking-widest">Seja o primeiro a postar!</span>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {feedItems.map((item) => {
              if (item.type === 'sponsor') {
                return (
                  <SponsorFeedCard
                    key={item.key}
                    partner={item.data}
                    photoUrl={item.photoUrl}
                    variant="timeline"
                  />
                );
              }

              const photo = item.data;
              const isSelected = selectedPrintPhotos.includes(photo.id);
              return (
                <div key={item.key} className="relative">
                  <TimelinePostCard
                    photo={photo}
                    user={user}
                    event={event}
                    onLogin={onLogin}
                  />

                  {/* Overlay de seleção para impressão */}
                  {isSelectingForPrint && (
                    <button
                      onClick={() => togglePhotoSelection(photo.id)}
                      className={cn(
                        "absolute top-18 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 shadow-lg",
                        isSelected
                          ? "bg-green-500 border-green-400 text-white"
                          : "bg-white/80 backdrop-blur-md border-neutral-200 text-transparent"
                      )}
                    >
                      <Check className="w-4 h-4 stroke-[3px]" />
                    </button>
                  )}
                </div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
