import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Star, Briefcase, LayoutGrid, Rows3, Camera } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useEventPhotos } from '../hooks/useEventPhotos';
import { useCategoryGroups } from '../hooks/useCategoryGroups';
import { useSlideshow } from '../hooks/useSlideshow';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import { FeaturedSlideshow } from './Feed/FeaturedSlideshow';
import { FeedGrid } from './Feed/FeedGrid';
import { TimelineFeed } from './Feed/TimelineFeed';
import { UploadFAB } from './Feed/UploadFAB';
import { LoginBanner } from './Feed/LoginBanner';
import { PartnerSection } from './PartnerSection';
import { ExhibitorDetailModal } from './ExhibitorDetailModal';
import { ExhibitorList } from './ExhibitorList';
import { getExhibitors } from '../../../services/exhibitorService';
import { getPartners } from '../../../services/partnerService';
import { getExhibitorCategories } from '../../../services/exhibitorCategoryService';
import type { EventData, AppUser, Exhibitor, Partner, ExhibitorCategory } from '../../../types';
import { cn, rotateByTime, SPONSOR_ROTATION_MS } from '../../../lib/utils';

type Tab = 'expositores' | 'patrocinadores' | 'fotos';

interface Props {
  event: EventData;
  user: AppUser | null;
  onLogin: () => void;
  isSelectingForPrint: boolean;
  selectedPrintPhotos: string[];
  togglePhotoSelection: (id: string) => void;
}

export const LiveEventView = ({ event, user, onLogin, isSelectingForPrint, selectedPrintPhotos, togglePhotoSelection }: Props) => {
  const [tab, setTab] = useState<Tab>('fotos');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>(() => {
    return (localStorage.getItem('eventify_feed_view_mode') as 'grid' | 'timeline') || 'grid';
  });
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [categories, setCategories] = useState<ExhibitorCategory[]>([]);
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null);

  const { photos } = useEventPhotos(event.id);
  const categoryGroups = useCategoryGroups(photos, event);
  const { currentGroupIndex, currentPhotoIndex, setCurrentPhotoIndex } = useSlideshow(categoryGroups);
  const { uploading, handleDirectUpload } = usePhotoUpload(event, user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getExhibitors(event.id).then(setExhibitors).catch(() => {});
    getPartners(event.id).then(setPartners).catch(() => {});
    getExhibitorCategories(event.id).then(setCategories).catch(() => {});
  }, [event.id]);

  // Rodízio justo dos patrocinadores/apoiadores (e serviços): gira a ordem para
  // não mostrar sempre o mesmo primeiro — mesma regra dos expositores
  // (rotateByTime). Como há poucos patrocinadores (até ~10), giramos a cada 5
  // min em vez de 1, para a troca ser mais suave dando visibilidade igual a todos.
  const sponsors = useMemo(
    () => rotateByTime(partners.filter(p => p.type === 'patrocinador' || p.type === 'apoiador'), SPONSOR_ROTATION_MS),
    [partners],
  );
  const services = useMemo(
    () => rotateByTime(partners.filter(p => p.type === 'servico'), SPONSOR_ROTATION_MS),
    [partners],
  );
  const officialPhotos = photos.filter(p => p.status === 'approved' && p.is_official);
  const galleryPhotos = photos.filter(p => !p.is_official);

  const handleFabClick = () => {
    if (!user) { onLogin(); return; }
    fileInputRef.current?.click();
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'fotos', label: 'Fotos', count: photos.length },
    { key: 'expositores', label: 'Expositores', count: exhibitors.length },
    { key: 'patrocinadores', label: 'Patrocinadores', count: sponsors.length },
  ];

  const handleViewModeChange = (mode: 'grid' | 'timeline') => {
    setViewMode(mode);
    localStorage.setItem('eventify_feed_view_mode', mode);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Live banner */}
      <div className="mx-4 mt-4 rounded-2xl bg-white border border-[#FFD1D1] p-3 flex items-center gap-3">
        <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
          <span className="absolute w-5 h-5 rounded-full bg-[#E84545]/20 animate-ping" />
          <span className="relative w-2.5 h-2.5 rounded-full bg-[#E84545]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#E84545]">Acontecendo agora</p>
          <p className="text-[10px] text-[#94949E] font-medium">Feed em tempo real</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 px-4 mt-4 border-b border-[#ECECF1] bg-[#F5F5F7]">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold border-b-[2.5px] transition-all ${
              tab === t.key
                ? 'border-[#3FA790] text-[#2D2D3F] font-bold'
                : 'border-transparent text-[#7A7A8E] hover:text-[#5A5A6E]'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'text-[#3FA790] bg-[#E8F6F2]' : 'text-[#B5B5C0] bg-[#F0F0F4]'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {tab === 'fotos' && (
          <div className="space-y-6">
            <FeaturedSlideshow
              event={event}
              categoryGroups={categoryGroups}
              currentGroupIndex={currentGroupIndex}
              currentPhotoIndex={currentPhotoIndex}
              onSetPhotoIndex={setCurrentPhotoIndex}
            />
            {!user && <LoginBanner onLogin={onLogin} />}
            {/* Cabeçalho do Feed com seletor de layout no padrão de Expositores */}
            <div className="flex items-center justify-between px-2 max-w-xl mx-auto mt-4">
              <div className="flex flex-col">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#2D2D3F] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-neutral-400" /> Feed do Evento
                </h2>
                <span className="text-[11px] text-[#94949E] font-medium mt-1">
                  {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
                </span>
              </div>

              <div className="flex items-center gap-0.5 bg-[#F0F0F4] rounded-lg p-0.5 shrink-0">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  title="Grade"
                  className={`px-3 py-1 rounded-md text-[12px] transition-all flex items-center justify-center cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#2D2D3F] shadow-sm font-bold'
                      : 'text-[#94949E] hover:text-[#5A5A6E]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleViewModeChange('timeline')}
                  title="Linha do Tempo"
                  className={`px-3 py-1 rounded-md text-[12px] transition-all flex items-center justify-center cursor-pointer ${
                    viewMode === 'timeline'
                      ? 'bg-white text-[#2D2D3F] shadow-sm font-bold'
                      : 'text-[#94949E] hover:text-[#5A5A6E]'
                  }`}
                >
                  <Rows3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {viewMode === 'grid' ? (
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
            ) : (
              <TimelineFeed
                event={event}
                user={user}
                onLogin={onLogin}
                officialPhotos={officialPhotos}
                galleryPhotos={galleryPhotos}
                isSelectingForPrint={isSelectingForPrint}
                selectedPrintPhotos={selectedPrintPhotos}
                togglePhotoSelection={togglePhotoSelection}
              />
            )}
          </div>
        )}

        {tab === 'expositores' && (
          <ExhibitorList
            exhibitors={exhibitors}
            categories={categories}
            onSelect={setSelectedExhibitor}
            event={{ id: event.id, status: event.status }}
            user={user}
          />
        )}

        {tab === 'patrocinadores' && (
          <div className="space-y-8">
            {sponsors.length > 0 && (
              <PartnerSection title="Patrocinadores & Apoiadores" items={sponsors.map(s => ({ id: s.id, name: s.name, bio: s.description ?? '', logo: s.logo_url ?? undefined, photos: s.photos, socials: { instagram: s.instagram_url ?? undefined, tiktok: s.tiktok_url ?? undefined, youtube: s.youtube_url ?? undefined, whatsapp: s.whatsapp ?? undefined, website: s.website_url ?? undefined, email: s.email ?? undefined, phone: s.phone ?? undefined } }))} icon={<Star className="w-5 h-5" />} />
            )}
            {services.length > 0 && (
              <PartnerSection title="Serviços" items={services.map(s => ({ id: s.id, name: s.name, bio: s.description ?? '', logo: s.logo_url ?? undefined, photos: s.photos, socials: { instagram: s.instagram_url ?? undefined, tiktok: s.tiktok_url ?? undefined, youtube: s.youtube_url ?? undefined, whatsapp: s.whatsapp ?? undefined, website: s.website_url ?? undefined, email: s.email ?? undefined, phone: s.phone ?? undefined } }))} icon={<Briefcase className="w-5 h-5" />} />
            )}
            {sponsors.length === 0 && services.length === 0 && (
              <div className="text-center py-16 text-[#94949E]">
                <p className="text-sm font-medium">Nenhum patrocinador cadastrado ainda.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB sempre visível no live */}
      <UploadFAB event={event} uploading={uploading} onFabClick={handleFabClick} fileInputRef={fileInputRef} onFileSelect={e => { const f = e.target.files?.[0]; if (f) handleDirectUpload(f); }} />

      <AnimatePresence>
        {selectedExhibitor && (
          <ExhibitorDetailModal
            exhibitor={selectedExhibitor}
            exhibitors={exhibitors}
            categories={categories}
            event={event}
            user={user}
            onClose={() => setSelectedExhibitor(null)}
            onSelectRelated={setSelectedExhibitor}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
