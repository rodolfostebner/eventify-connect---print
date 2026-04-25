import React, { useRef } from 'react';
import { useEventPhotos } from '../hooks/useEventPhotos';
import { useCategoryGroups } from '../hooks/useCategoryGroups';
import { useSlideshow } from '../hooks/useSlideshow';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import { FeaturedSlideshow } from './Feed/FeaturedSlideshow';
import { FeedGrid } from './Feed/FeedGrid';
import { UploadFAB } from './Feed/UploadFAB';
import { LoginBanner } from './Feed/LoginBanner';
import type { EventData } from '../../../types';
import { User } from '../../../services/authService';

interface LiveEventViewProps {
  event: EventData;
  user: User | null;
  onLogin: () => void;
  isSelectingForPrint: boolean;
  selectedPrintPhotos: string[];
  togglePhotoSelection: (id: string) => void;
}

export const LiveEventView = ({
  event,
  user,
  onLogin,
  isSelectingForPrint,
  selectedPrintPhotos,
  togglePhotoSelection
}: LiveEventViewProps) => {
  const { photos } = useEventPhotos(event.id);
  const categoryGroups = useCategoryGroups(photos, event);
  const {
    currentGroupIndex,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    setPhotoIndex
  } = useSlideshow(categoryGroups);

  const { uploading, handleDirectUpload } = usePhotoUpload(event, user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFabClick = () => {
    if (!user) {
      onLogin();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDirectUpload(file);
    }
  };

  const officialPhotos = photos.filter(p => p.status === 'approved' && p.is_official);
  const galleryPhotos = photos.filter(p => !p.is_official);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12 space-y-12 md:space-y-24">
      {/* Live Status Indicator */}
      <div className="flex items-center justify-center gap-3 py-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-neutral-500">
          Feed em Tempo Real
        </span>
      </div>

      <FeaturedSlideshow
        event={event}
        categoryGroups={categoryGroups}
        currentGroupIndex={currentGroupIndex}
        currentPhotoIndex={currentPhotoIndex}
        onSetPhotoIndex={setCurrentPhotoIndex}
      />

      <FeedGrid
        event={event}
        user={user}
        onLogin={onLogin}
        officialPhotos={officialPhotos}
        galleryPhotos={galleryPhotos}
        isSelectingForPrint={isSelectingForPrint}
        selectedPrintPhotos={selectedPrintPhotos}
        togglePhotoSelection={togglePhotoSelection}
      />

      <UploadFAB
        event={event}
        uploading={uploading}
        onFabClick={handleFabClick}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
      />

      {!user && <LoginBanner onLogin={onLogin} />}
    </div>
  );
};
