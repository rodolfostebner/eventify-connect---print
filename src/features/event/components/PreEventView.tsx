import React, { useState, useEffect } from 'react';
import { Users, Star, Briefcase } from 'lucide-react';
import type { EventData } from '../../../types';
import { PartnerSection } from './PartnerSection';

export const PreEventView = ({ event }: { event: EventData }) => {
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
    <div className="p-6 space-y-12">
      {/* Countdown placeholder */}
      <div
        className="text-white rounded-[40px] p-10 text-center shadow-2xl relative overflow-hidden"
        style={{ backgroundColor: event.primary_color || '#171717' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40 mb-6" style={{ color: event.secondary_color || '#ffffff' }}>O evento começa em</p>
        <div className="flex justify-center gap-6" style={{ color: event.secondary_color || '#ffffff' }}>
          <div className="flex flex-col">
            <span className="text-5xl font-black tracking-tighter">{timeLeft.days.toString().padStart(2, '0')}</span>
            <span className="text-[9px] uppercase font-bold opacity-40 tracking-widest mt-1">Dias</span>
          </div>
          <span className="text-5xl font-light opacity-20">:</span>
          <div className="flex flex-col">
            <span className="text-5xl font-black tracking-tighter">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-[9px] uppercase font-bold opacity-40 tracking-widest mt-1">Horas</span>
          </div>
          <span className="text-5xl font-light opacity-20">:</span>
          <div className="flex flex-col">
            <span className="text-5xl font-black tracking-tighter">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-[9px] uppercase font-bold opacity-40 tracking-widest mt-1">Minutos</span>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        <PartnerSection 
          title="Expositores" 
          items={event.exhibitors || []} 
          icon={<Users className="w-4 h-4" />} 
        />
        <PartnerSection 
          title="Patrocinadores" 
          items={event.sponsors || []} 
          icon={<Star className="w-4 h-4" />} 
        />
        <PartnerSection 
          title="Serviços" 
          items={event.services || []} 
          icon={<Briefcase className="w-4 h-4" />} 
        />
      </div>

      <div className="text-center py-16">
        <p className="text-neutral-300 italic font-medium text-sm">"O feed interativo abrirá em breve!"</p>
      </div>
    </div>
  );
};
