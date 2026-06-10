import React from 'react';
import { ChevronRight, Globe } from 'lucide-react';
import type { Exhibitor, ExhibitorCategory, AppUser } from '../../../types';
import { trackVisit } from '../../../services/visitService';
import { formatInstagram, formatWhatsApp, formatWebsite } from '../../../utils/formatters';
import { WhatsAppIcon, InstagramIcon } from './BrandIcons';

export type CardSize = 'small' | 'medium' | 'large';

interface Props {
  exhibitor: Exhibitor;
  category?: ExhibitorCategory;
  size: CardSize;
  onSelect: (ex: Exhibitor) => void;
  event?: { id: string; status: 'pre' | 'live' | 'post' };
  user?: AppUser | null;
}

function LogoThumb({ exhibitor, category, className }: {
  exhibitor: Exhibitor;
  category?: ExhibitorCategory;
  className: string;
}) {
  const color = category?.color ?? '#94949E';
  if (exhibitor.logo_url) {
    return <img src={exhibitor.logo_url} alt={exhibitor.name} className={`object-contain bg-white ${className}`} />;
  }
  return (
    <div
      className={`flex items-center justify-center text-white font-black ${className}`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
    >
      {exhibitor.name.charAt(0).toUpperCase()}
    </div>
  );
}

export function ExhibitorCard({ exhibitor, category, size, onSelect, event, user }: Props) {
  const color = category?.color ?? '#94949E';

  const handleSocial = (e: React.MouseEvent, type: 'instagram' | 'whatsapp' | 'website', url: string) => {
    e.stopPropagation();
    if (event) {
      void trackVisit({ eventId: event.id, exhibitorId: exhibitor.id, userId: user?.id, action: `click_${type}` as any, eventStatus: event.status });
    }
    const href = type === 'instagram' ? formatInstagram(url) : type === 'whatsapp' ? formatWhatsApp(url) : formatWebsite(url);
    if (href) window.open(href, '_blank');
  };

  if (size === 'small') {
    return (
      <button
        onClick={() => onSelect(exhibitor)}
        className="bg-white border border-[#ECECF1] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-neutral-300 transition-all text-left active:scale-[0.98] w-full"
      >
        <div className="h-[76px] w-full overflow-hidden relative">
          <LogoThumb exhibitor={exhibitor} category={category} className="w-full h-full text-3xl" />
        </div>
        <div className="p-2.5">
          {category && (
            <p className="text-[9px] font-black uppercase tracking-[0.12em] mb-0.5" style={{ color }}>
              {category.name}
            </p>
          )}
          <p className="text-[12.5px] font-bold text-[#2D2D3F] leading-snug line-clamp-2">{exhibitor.name}</p>
        </div>
      </button>
    );
  }

  if (size === 'large') {
    return (
      <div className="bg-white border border-[#ECECF1] rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 flex items-start gap-3">
          <LogoThumb exhibitor={exhibitor} category={category} className="w-11 h-11 rounded-lg shrink-0 text-lg" />
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-bold text-[#2D2D3F] leading-tight">{exhibitor.name}</p>
            {exhibitor.description && (
              <p className="text-[11.5px] text-[#7A7A8E] mt-0.5 line-clamp-2 leading-snug">{exhibitor.description}</p>
            )}
            {category && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-[#94949E] font-medium">{category.name}</span>
              </div>
            )}
          </div>
        </div>

        <div
          className="h-[140px] w-full relative overflow-hidden flex items-center justify-center"
          style={{ background: exhibitor.photo_url ? undefined : `linear-gradient(135deg, ${color}22, ${color}66)` }}
        >
          {exhibitor.photo_url
            ? <img src={exhibitor.photo_url} alt={exhibitor.name} className="w-full h-full object-cover" />
            : <span className="text-[70px] leading-none select-none font-black text-white/50">{exhibitor.name.charAt(0).toUpperCase()}</span>
          }
          {category && (
            <span
              className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider"
              style={{ backgroundColor: color }}
            >
              {category.icon} {category.name}
            </span>
          )}
        </div>

        <div className="p-3 flex items-center gap-2">
          {exhibitor.instagram_url && (
            <button onClick={e => handleSocial(e, 'instagram', exhibitor.instagram_url!)} className="w-[34px] h-[34px] rounded-full bg-[#F0F0F4] flex items-center justify-center hover:bg-neutral-200 transition-colors shrink-0">
              <InstagramIcon className="w-[18px] h-[18px]" />
            </button>
          )}
          {exhibitor.whatsapp && (
            <button onClick={e => handleSocial(e, 'whatsapp', `https://wa.me/${exhibitor.whatsapp!.replace(/\D/g, '')}`)} className="w-[34px] h-[34px] rounded-full bg-[#F0F0F4] flex items-center justify-center hover:bg-neutral-200 transition-colors shrink-0">
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            </button>
          )}
          {exhibitor.website_url && (
            <button onClick={e => handleSocial(e, 'website', exhibitor.website_url!)} className="w-[34px] h-[34px] rounded-full bg-[#F0F0F4] flex items-center justify-center hover:bg-neutral-200 transition-colors shrink-0">
              <Globe className="w-4 h-4 text-[#5A5A6E]" />
            </button>
          )}
          <button
            onClick={() => onSelect(exhibitor)}
            className="flex-1 py-2 rounded-full text-[11px] font-bold text-white text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: color }}
          >
            Confira o catálogo →
          </button>
        </div>
      </div>
    );
  }

  // medium
  const subtitle = exhibitor.tagline || exhibitor.description;
  return (
    <button
      onClick={() => onSelect(exhibitor)}
      className="w-full bg-white border border-[#ECECF1] rounded-xl p-2.5 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all text-left active:scale-[0.99]"
    >
      <LogoThumb exhibitor={exhibitor} category={category} className="w-11 h-11 rounded-lg shrink-0 text-lg" />
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-bold text-[#2D2D3F] leading-tight truncate">{exhibitor.name}</p>
        {subtitle && (
          <p className="text-[11.5px] text-[#7A7A8E] mt-0.5 truncate">{subtitle}</p>
        )}
        {category && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-[#94949E] font-medium">{category.name}</span>
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
    </button>
  );
}
