import React from 'react';
import { Users } from 'lucide-react';
import { SocialLinks } from './SocialLinks';
import { cn } from '../../../lib/utils';

interface PartnerItem {
  id?: string;
  logo?: string;
  name: string;
  bio?: string;
  photo?: string;
  message?: string;
  final_message?: string;
  socials?: {
    instagram?: string;
    whatsapp?: string;
    website?: string;
  };
}

interface PartnerSectionProps {
  title: string;
  items: PartnerItem[];
  icon: React.ReactNode;
  showMessages?: boolean;
  columns?: number;
}

export function PartnerSection({ title, items, icon, showMessages = false, columns }: PartnerSectionProps) {
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
            {item.photo && (
              <div className="aspect-video rounded-lg md:rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100">
                <img src={item.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            {showMessages && (item.message || item.final_message) && (
              <div className="bg-neutral-50 p-3 md:p-4 rounded-lg border border-neutral-100 border-l-4 border-l-neutral-900">
                <p className="text-xs md:text-sm italic text-neutral-600">"{item.message || item.final_message}"</p>
              </div>
            )}
            {item.socials && (
              <div className="border-t border-neutral-100 pt-2 mt-auto">
                <SocialLinks 
                  instagram={item.socials.instagram}
                  whatsapp={item.socials.whatsapp}
                  website={item.socials.website}
                  buttonClassName="p-1.5 md:p-2 bg-neutral-50 rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
