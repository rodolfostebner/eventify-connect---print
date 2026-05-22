import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Users, Star, Briefcase } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useEventPhotos } from '../hooks/useEventPhotos';
import { useCategoryGroups } from '../hooks/useCategoryGroups';
import { useSlideshow } from '../hooks/useSlideshow';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import { FeaturedSlideshow } from './Feed/FeaturedSlideshow';
import { FeedGrid } from './Feed/FeedGrid';
import { UploadFAB } from './Feed/UploadFAB';
import { LoginBanner } from './Feed/LoginBanner';
import { PartnerSection } from './PartnerSection';
import { ExhibitorCatalogModal } from './ExhibitorCatalogModal';
import type { SocialLinkType } from './SocialLinks';
import { getExhibitors } from '../../../services/exhibitorService';
import { getPartners } from '../../../services/partnerService';
import { trackVisit } from '../../../services/visitService';
import type { EventData, AppUser, Exhibitor, Partner } from '../../../types';

interface LiveEventViewProps {
  event: EventData;
  user: AppUser | null;
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

  const [dbExhibitors, setDbExhibitors] = useState<Exhibitor[]>([]);
  const [dbSponsors, setDbSponsors] = useState<Partner[]>([]);
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null);

  useEffect(() => {
    getExhibitors(event.id).then(setDbExhibitors).catch(() => {});
    getPartners(event.id).then(setDbSponsors).catch(() => {});
  }, [event.id]);

  const exhibitorItems = dbExhibitors.map(ex => ({
    id: ex.id,
    name: ex.name,
    logo: ex.logo_url ?? undefined,
    photo: ex.photo_url ?? undefined,
    bio: ex.description ?? '',
    message: ex.message ?? undefined,
    final_message: ex.final_message ?? undefined,
    socials: {
      instagram: ex.instagram_url ?? undefined,
      whatsapp: ex.whatsapp ?? undefined,
      website: ex.website_url ?? undefined,
    },
  }));

  const sponsorItems = dbSponsors.map(s => ({
    id: s.id,
    name: s.name,
    bio: s.description ?? '',
    photos: s.photos,
    socials: {
      instagram: s.instagram_url ?? undefined,
      whatsapp: s.whatsapp ?? undefined,
      website: s.website_url ?? undefined,
    },
  }));

  const handleExhibitorSocialClick = useCallback(
    (item: { id?: string }, type: SocialLinkType) => {
      if (!item.id) return;
      void trackVisit({
        eventId: event.id,
        exhibitorId: item.id,
        userId: user?.id,
        action: `click_${type}` as const,
        eventStatus: event.status,
      });
    },
    [event.id, event.status, user?.id],
  );

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

      {/* Expositores & Patrocinadores */}
      <div className="space-y-12 md:space-y-24">
        <PartnerSection
          title="Expositores"
          items={exhibitorItems}
          icon={<Users className="w-5 h-5" />}
          onViewCatalog={dbExhibitors.length > 0 ? (item) => {
            const found = dbExhibitors.find(ex => ex.id === item.id);
            if (found) setSelectedExhibitor(found);
          } : undefined}
          onItemSocialClick={handleExhibitorSocialClick}
        />
        <PartnerSection
          title="Patrocinadores"
          items={sponsorItems}
          icon={<Star className="w-5 h-5" />}
        />
        <PartnerSection
          title="Serviços"
          items={event.services || []}
          icon={<Briefcase className="w-5 h-5" />}
        />
      </div>

      <UploadFAB
        event={event}
        uploading={uploading}
        onFabClick={handleFabClick}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
      />

      {!user && <LoginBanner onLogin={onLogin} />}

      <AnimatePresence>
        {selectedExhibitor && (
          <ExhibitorCatalogModal
            exhibitor={selectedExhibitor}
            eventStatus={event.status}
            eventId={event.id}
            userId={user?.id}
            primaryColor={event.primary_color || '#171717'}
            onClose={() => setSelectedExhibitor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
