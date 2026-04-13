import React, { useState, useEffect } from 'react';
import { Users, Star, Briefcase } from 'lucide-react';
import type { EventData } from '../../types';
import { PartnerSection } from './components/PartnerSection';

export function PreEventView({ event }: { event: EventData }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!event.date) return;

    const calculateTimeLeft = () => {
      const difference = new Date(event.date!).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [event.date]);

  return (
    <div className="p-6 space-y-8">
      {/* Countdown placeholder */}
      <div
        className="text-white rounded-3xl p-8 text-center shadow-xl shadow-neutral-200"
        style={{ backgroundColor: event.primary_color || '#171717' }}
      >
        <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-60 mb-4" style={{ color: event.secondary_color || '#ffffff' }}>O evento começa em</p>
        <div className="flex justify-center gap-4" style={{ color: event.secondary_color || '#ffffff' }}>
          <div className="flex flex-col">
            <span className="text-4xl font-bold">{timeLeft.days.toString().padStart(2, '0')}</span>
            <span className="text-[10px] uppercase opacity-50">Dias</span>
          </div>
          <span className="text-4xl font-light opacity-30">:</span>
          <div className="flex flex-col">
            <span className="text-4xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-[10px] uppercase opacity-50">Horas</span>
          </div>
          <span className="text-4xl font-light opacity-30">:</span>
          <div className="flex flex-col">
            <span className="text-4xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-[10px] uppercase opacity-50">Min</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <PartnerSection title="Expositores" items={event.exhibitors || []} icon={<Users className="w-4 h-4" />} />
        <PartnerSection title="Patrocinadores" items={event.sponsors || []} icon={<Star className="w-4 h-4" />} />
        <PartnerSection title="Serviços" items={event.services || []} icon={<Briefcase className="w-4 h-4" />} />
      </div>

      <div className="text-center py-12">
        <p className="text-neutral-400 italic font-serif">"O feed interativo abrirá em breve!"</p>
      </div>
    </div>
  );
}
