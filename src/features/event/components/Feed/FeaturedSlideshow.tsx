import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../../lib/utils';
import type { EventData, PhotoData } from '../../../../types';

interface DotButtonProps {
  index: number;
  isActive: boolean;
  onClick: (idx: number) => void;
}

const DotButton = memo(({ index, isActive, onClick }: DotButtonProps) => (
  <button
    onClick={() => onClick(index)}
    className={cn(
      "h-1.5 rounded-full transition-all duration-500",
      isActive ? "w-8 bg-neutral-900" : "w-1.5 bg-neutral-200"
    )}
  />
));
DotButton.displayName = 'DotButton';

interface FeaturedSlideshowProps {
  event: EventData;
  categoryGroups: { title: string; photos: PhotoData[] }[];
  currentGroupIndex: number;
  currentPhotoIndex: number;
  onSetPhotoIndex: (idx: number) => void;
}

export const FeaturedSlideshow = ({ 
  event, 
  categoryGroups, 
  currentGroupIndex, 
  currentPhotoIndex,
  onSetPhotoIndex
}: FeaturedSlideshowProps) => {
  if (categoryGroups.length === 0) return null;
  
  const currentGroup = categoryGroups[currentGroupIndex];
  if (!currentGroup) return null;
  
  const currentPhoto = currentGroup.photos[currentPhotoIndex];
  if (!currentPhoto) return null;

  return (
    <section className="relative px-2">
      <div className="text-center mb-10">
        <h2
          className="text-3xl md:text-5xl font-black inline-block relative tracking-tighter uppercase"
          style={{
            color: event.primary_color || '#171717',
            textShadow: `2px 2px 0px ${event.secondary_color || '#e5e5e5'}80`
          }}
        >
          Destaques
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1/2 h-1.5 rounded-full opacity-80"
            style={{ backgroundColor: event.secondary_color || '#e5e5e5' }}
          />
        </h2>
      </div>

      <div className="aspect-video bg-white rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-white relative group">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentGroupIndex}-${currentPhotoIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={currentPhoto.url}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-2 mb-3">
                 <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  {currentGroup.title}
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                {currentPhoto.user_name}
              </h3>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-1.5 mt-6">
        {currentGroup.photos.map((_, idx) => (
          <DotButton
            key={`dot-${idx}`}
            index={idx}
            isActive={currentPhotoIndex === idx}
            onClick={onSetPhotoIndex}
          />
        ))}
      </div>
    </section>
  );
};
