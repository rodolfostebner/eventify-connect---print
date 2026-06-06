import React, { useState } from 'react';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { SocialLinks, type SocialLinkType } from './SocialLinks';
import { cn } from '../../../lib/utils';

interface PartnerItem {
  id?: string;
  logo?: string;
  name: string;
  bio?: string;
  photo?: string;
  photos?: string[];
  message?: string;
  final_message?: string;
  socials?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
    website?: string;
    email?: string;
    phone?: string;
  };
}

function ItemPhotoCarousel({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) return null;

  return (
    <div className="relative">
      <div className="aspect-video rounded-lg md:rounded-xl overflow-hidden bg-black border border-neutral-100">
        <img src={photos[index]} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
      </div>
      {photos.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setIndex(i => Math.max(0, i - 1)); }}
            disabled={index === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white disabled:opacity-20 transition-opacity"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setIndex(i => Math.min(photos.length - 1, i + 1)); }}
            disabled={index === photos.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white disabled:opacity-20 transition-opacity"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="flex justify-center gap-1 mt-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setIndex(i); }}
                className={cn('h-1 rounded-full transition-all', i === index ? 'bg-neutral-700 w-3' : 'bg-neutral-300 w-1')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface PartnerSectionProps {
  title: string;
  items: PartnerItem[];
  icon: React.ReactNode;
  showMessages?: boolean;
  columns?: number;
  onViewCatalog?: (item: PartnerItem) => void;
  // Callback opcional para tracking de cliques em links sociais. Recebe o item e o tipo.
  onItemSocialClick?: (item: PartnerItem, type: SocialLinkType) => void;
}

export function PartnerSection({ title, items, icon, showMessages = false, columns, onViewCatalog, onItemSocialClick }: PartnerSectionProps) {
  if (!items || items.length === 0) return null;

  const gridCols = columns === 1 
    ? "grid-cols-1 w-full" 
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";

  return (
    <section className="space-y-4 text-left">
      <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2 px-2">
        {icon} {title}
      </h2>
      <div className={cn("grid gap-4 md:gap-6", gridCols)}>
        {items.map((item, i) => (
          <div key={item.id || i} className="bg-white p-4 md:p-5 rounded-xl border border-neutral-100 shadow-sm flex flex-col gap-3 md:gap-4 transition-all hover:shadow-md">
            <div className="flex gap-3 md:gap-4 items-center">
              {item.logo ? (
                <img src={item.logo} className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-contain bg-neutral-50 p-2 shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-neutral-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-neutral-900 text-sm md:text-base truncate">{item.name}</h3>
                <p className="text-[10px] md:text-xs text-neutral-500 line-clamp-2 leading-tight md:leading-normal">{item.bio}</p>
              </div>
            </div>
            {(item.photos && item.photos.length > 0)
              ? <ItemPhotoCarousel photos={item.photos} />
              : item.photo
                ? <div className="aspect-video rounded-lg md:rounded-xl overflow-hidden bg-black border border-neutral-100">
                    <img src={item.photo} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                : null
            }
            {showMessages && (item.message || item.final_message) && (
              <div className="bg-neutral-50 p-3 md:p-4 rounded-lg border border-neutral-100 border-l-4 border-l-neutral-900">
                <p className="text-xs md:text-sm italic text-neutral-600">"{item.message || item.final_message}"</p>
              </div>
            )}
            {item.socials && (
              <div className="border-t border-neutral-100 pt-2 mt-auto">
                <SocialLinks
                  instagram={item.socials.instagram}
                  tiktok={item.socials.tiktok}
                  youtube={item.socials.youtube}
                  whatsapp={item.socials.whatsapp}
                  website={item.socials.website}
                  email={item.socials.email}
                  phone={item.socials.phone}
                  buttonClassName="p-1.5 md:p-2 bg-neutral-50 rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
                  onLinkClick={onItemSocialClick ? (type) => onItemSocialClick(item, type) : undefined}
                />
              </div>
            )}
            {onViewCatalog && (
              <button
                onClick={() => onViewCatalog(item)}
                className="w-full py-2 rounded-lg text-xs font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                Confira o catálogo →
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
