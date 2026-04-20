import React from 'react';
import { Star, Camera, Image as ImageIcon, Check } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { cn } from '../../../../lib/utils';
import type { EventData, PhotoData } from '../../../../types';
import { User } from '../../../../services/authService';
import { PhotoCard } from '../PhotoCard/PhotoCard';

interface FeedGridProps {
  event: EventData;
  user: User | null;
  onLogin: () => void;
  officialPhotos: PhotoData[];
  galleryPhotos: PhotoData[];
  isSelectingForPrint: boolean;
  selectedPrintPhotos: string[];
  togglePhotoSelection: (id: string) => void;
}

export const FeedGrid = ({
  event,
  user,
  onLogin,
  officialPhotos,
  galleryPhotos,
  isSelectingForPrint,
  selectedPrintPhotos,
  togglePhotoSelection
}: FeedGridProps) => {
  return (
    <div className="space-y-12">
      {/* Official Photos Section */}
      {event.has_official_photos && officialPhotos.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" /> Fotos Oficiais
            </h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-50 border border-neutral-100 px-3 py-1 rounded-full">Equipe</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x custom-scrollbar">
            {officialPhotos.map((photo) => (
              <div key={photo.id} className="min-w-[300px] snap-center">
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

      {/* Main Feed Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
            <Camera className="w-4 h-4" /> Feed do Evento
          </h2>
          <span className="text-[10px] font-bold text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-full">{galleryPhotos.length} fotos</span>
        </div>

        {galleryPhotos.length === 0 ? (
          <div className="text-center py-24 bg-neutral-50/50 border-2 border-dashed border-neutral-100 rounded-[40px]">
            <ImageIcon className="w-12 h-12 mx-auto text-neutral-200 mb-4" />
            <p className="text-neutral-400 text-sm font-bold">Nenhuma foto ainda.<br/><span className="text-[10px] font-normal uppercase tracking-widest">Seja o primeiro a postar!</span></p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {galleryPhotos.map((photo) => {
                const isSelected = selectedPrintPhotos.includes(photo.id);
                return (
                  <div key={photo.id} className="relative">
                    <PhotoCard photo={photo} user={user} event={event} onLogin={onLogin} />
                    {isSelectingForPrint && (
                      <button
                        onClick={() => togglePhotoSelection(photo.id)}
                        className={cn(
                          "absolute top-3 right-3 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 shadow-lg",
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
      </section>
    </div>
  );
};
