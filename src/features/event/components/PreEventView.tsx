import React, { useState, useEffect } from 'react';
import { Star, Briefcase } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import type { EventData, Exhibitor, Partner, ExhibitorCategory, AppUser } from '../../../types';
import { getExhibitors } from '../../../services/exhibitorService';
import { getPartners } from '../../../services/partnerService';
import { getExhibitorCategories } from '../../../services/exhibitorCategoryService';
import { ExhibitorList } from './ExhibitorList';
import { ExhibitorDetailModal } from './ExhibitorDetailModal';
import { PartnerSection } from './PartnerSection';
import { parseEventDate } from '../../../lib/utils';

type Tab = 'expositores' | 'patrocinadores';

interface Props {
  event: EventData;
  user?: AppUser | null;
}

export const PreEventView = ({ event, user }: Props) => {
  const [tab, setTab] = useState<Tab>('expositores');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [categories, setCategories] = useState<ExhibitorCategory[]>([]);
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null);

  useEffect(() => {
    if (!event.date) return;
    const target = parseEventDate(event.date);
    if (!target) return;
    const calc = () => {
      const diff = target.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60) });
      }
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [event.date]);

  useEffect(() => {
    getExhibitors(event.id).then(setExhibitors).catch(() => {});
    getPartners(event.id).then(setPartners).catch(() => {});
    getExhibitorCategories(event.id).then(setCategories).catch(() => {});
  }, [event.id]);

  const sponsors = partners.filter(p => p.type === 'patrocinador' || p.type === 'apoiador');
  const services = partners.filter(p => p.type === 'servico');

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'expositores', label: 'Expositores', count: exhibitors.length },
    { key: 'patrocinadores', label: 'Patrocinadores', count: sponsors.length },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Countdown ribbon */}
      {event.countdown_active && event.date && (
        <div
          className="mx-4 mt-4 rounded-2xl p-4 flex items-center justify-between shadow-md"
          style={{ background: `linear-gradient(135deg, ${event.primary_color || '#5BC0A8'}, ${event.primary_color || '#3FA790'})` }}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70 mb-0.5">Evento em</p>
            <p className="text-white font-black text-xl leading-none">
              {timeLeft.days}<span className="text-sm font-bold opacity-80">d </span>
              {String(timeLeft.hours).padStart(2, '0')}<span className="text-sm font-bold opacity-80">h </span>
              {String(timeLeft.minutes).padStart(2, '0')}<span className="text-sm font-bold opacity-80">m</span>
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-full text-[11px] font-black bg-white shadow-sm"
            style={{ color: event.primary_color || '#3FA790' }}
          >
            Em breve
          </div>
        </div>
      )}

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
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              tab === t.key ? 'text-[#3FA790] bg-[#E8F6F2]' : 'text-[#B5B5C0] bg-[#F0F0F4]'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
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

      <AnimatePresence>
        {selectedExhibitor && (
          <ExhibitorDetailModal
            exhibitor={selectedExhibitor}
            exhibitors={exhibitors}
            categories={categories}
            event={event}
            user={user ?? null}
            onClose={() => setSelectedExhibitor(null)}
            onSelectRelated={setSelectedExhibitor}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
