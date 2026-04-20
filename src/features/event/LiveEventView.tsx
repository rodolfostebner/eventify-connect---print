import React, { useRef, useMemo, useCallback } from 'react';
import { usePosts } from '../../hooks/usePosts';
import { usePhotoUpload } from './hooks/usePhotoUpload';
import { useCategoryGroups } from './hooks/useCategoryGroups';
import { useSlideshow } from './hooks/useSlideshow';
import { FeaturedSlideshow } from './components/Feed/FeaturedSlideshow';
import { FeedGrid } from './components/Feed/FeedGrid';
import { UploadFAB } from './components/Feed/UploadFAB';
import { LoginBanner } from './components/Feed/LoginBanner';
import type { EventData } from '../../types';
import { User } from '../../services/authService';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logic Hooks
  const { uploading, handleDirectUpload } = usePhotoUpload(event, user);
  const categoryGroups = useCategoryGroups(photos, event);
  const { currentGroupIndex, currentPhotoIndex, setCurrentPhotoIndex } = useSlideshow(categoryGroups);

  const officialPhotos = useMemo(() => photos.filter(p => p.status === 'approved' && p.is_official), [photos]);
  const galleryPhotos = useMemo(() => photos.filter(p => !p.is_official), [photos]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) handleDirectUpload(file);
  }, [user, handleDirectUpload]);

  const handleFabClick = useCallback(() => {
    if (user) {
      fileInputRef.current?.click();
    } else {
      onLogin();
    }
  }, [user, onLogin]);

  return (
    <div className="p-4 space-y-12">
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
}


