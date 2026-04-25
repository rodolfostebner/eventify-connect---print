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
    <div className="max-w-6xl mx-auto p-4 md:p-12 space-y-12 md:space-y-24">
      {/* Countdown Hero */}
      <div
        className="text-white rounded-2xl p-10 md:p-20 text-center shadow-xl relative overflow-hidden group"
        style={{ backgroundColor: event.primary_color || '#171717' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-black opacity-60 mb-8 md:mb-10" style={{ color: event.secondary_color || '#ffffff' }}>
            O evento começa em
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16" style={{ color: event.secondary_color || '#ffffff' }}>
            <div className="flex flex-col items-center min-w-[80px] md:min-w-[120px]">
              <span className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums leading-none">
                {timeLeft.days.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] md:text-xs uppercase font-bold opacity-50 tracking-widest mt-3 md:mt-4">Dias</span>
            </div>
            
            <span className="hidden md:block text-6xl md:text-7xl font-thin opacity-20 self-start mt-[-4px] md:mt-[-12px]">:</span>
            
            <div className="flex flex-col items-center min-w-[80px] md:min-w-[120px]">
              <span className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums leading-none">
                {timeLeft.hours.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] md:text-xs uppercase font-bold opacity-50 tracking-widest mt-3 md:mt-4">Horas</span>
            </div>
            
            <span className="hidden md:block text-6xl md:text-7xl font-thin opacity-20 self-start mt-[-4px] md:mt-[-12px]">:</span>
            
            <div className="flex flex-col items-center min-w-[80px] md:min-w-[120px]">
              <span className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums leading-none">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] md:text-xs uppercase font-bold opacity-50 tracking-widest mt-3 md:mt-4">Minutos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12 md:space-y-24">
        <PartnerSection 
          title="Expositores" 
          items={event.exhibitors || []} 
          icon={<Users className="w-5 h-5" />} 
        />
        <PartnerSection 
          title="Patrocinadores" 
          items={event.sponsors || []} 
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
    </div>
  );
};
