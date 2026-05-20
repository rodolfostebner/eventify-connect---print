import React, { useState, useEffect } from 'react';
import { Users, Star, Briefcase } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import type { EventData, Exhibitor, Sponsor } from '../../../types';
import { PartnerSection } from './PartnerSection';
import { ExhibitorCatalogModal } from './ExhibitorCatalogModal';
import { getExhibitors } from '../../../services/exhibitorService';
import { getSponsors } from '../../../services/sponsorService';

export const PreEventView = ({ event }: { event: EventData }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [dbExhibitors, setDbExhibitors] = useState<Exhibitor[]>([]);
  const [dbSponsors, setDbSponsors] = useState<Sponsor[]>([]);
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null);

  useEffect(() => {
    if (!event.date) return;
    const calculateTimeLeft = () => {
      const difference = new Date(event.date!).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [event.date]);

  useEffect(() => {
    getExhibitors(event.id).then(setDbExhibitors).catch(() => {});
    getSponsors(event.id).then(setDbSponsors).catch(() => {});
  }, [event.id]);

  // Mapeia Exhibitor (tabela) para o formato PartnerItem
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

  const exhibitorSource = exhibitorItems;

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
  const sponsorSource = sponsorItems;

  const handleViewCatalog = (item: { id?: string }) => {
    const found = dbExhibitors.find(ex => ex.id === item.id);
    if (found) setSelectedExhibitor(found);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12 space-y-12 md:space-y-24">
      {/* Countdown Hero */}
      <div
        className="text-white rounded-2xl p-5 md:p-20 text-center shadow-xl relative overflow-hidden group"
        style={{ backgroundColor: event.primary_color || '#171717' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none" />
        <div className="relative z-10">
          <p
            className="text-[9px] md:text-xs uppercase tracking-[0.4em] font-black opacity-60 mb-4 md:mb-10"
            style={{ color: event.secondary_color || '#ffffff' }}
          >
            O evento começa em
          </p>
          <div
            className="flex flex-wrap justify-center items-center gap-4 md:gap-16"
            style={{ color: event.secondary_color || '#ffffff' }}
          >
            {[
              { value: timeLeft.days, label: 'Dias' },
              { value: timeLeft.hours, label: 'Horas' },
              { value: timeLeft.minutes, label: 'Minutos' },
            ].map(({ value, label }, idx) => (
              <React.Fragment key={label}>
                {idx > 0 && (
                  <span className="hidden md:block text-6xl md:text-7xl font-thin opacity-20 self-start mt-[-4px] md:mt-[-12px]">
                    :
                  </span>
                )}
                <div className="flex flex-col items-center min-w-[56px] md:min-w-[120px]">
                  <span className="text-[2.5rem] md:text-8xl font-black tracking-tighter tabular-nums leading-none">
                    {value.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[9px] md:text-xs uppercase font-bold opacity-50 tracking-widest mt-2 md:mt-4">
                    {label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-12 md:space-y-24">
        <PartnerSection
          title="Expositores"
          items={exhibitorSource}
          icon={<Users className="w-5 h-5" />}
          onViewCatalog={dbExhibitors.length > 0 ? handleViewCatalog : undefined}
        />
        <PartnerSection
          title="Patrocinadores"
          items={sponsorSource}
          icon={<Star className="w-5 h-5" />}
        />
        <PartnerSection
          title="Serviços"
          items={event.services || []}
          icon={<Briefcase className="w-5 h-5" />}
        />
      </div>

      <div className="text-center py-12 md:py-20 border-t border-neutral-100">
        <p className="text-neutral-400 font-semibold text-sm md:text-base tracking-wide">
          "O feed interativo abrirá em breve!"
        </p>
      </div>

      {/* Catalog Modal */}
      <AnimatePresence>
        {selectedExhibitor && (
          <ExhibitorCatalogModal
            exhibitor={selectedExhibitor}
            eventStatus={event.status}
            primaryColor={event.primary_color || '#171717'}
            onClose={() => setSelectedExhibitor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
