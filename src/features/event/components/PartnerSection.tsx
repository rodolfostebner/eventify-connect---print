import React from 'react';
import { Users } from 'lucide-react';
import { SocialLinks } from './SocialLinks';

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
}

export function PartnerSection({ title, items, icon, showMessages = false }: PartnerSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4 text-left">
      <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2 px-2">
        {icon} {title}
      </h2>
      <div className="grid gap-4">
        {items.map((item, i) => (
          <div key={item.id || i} className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              {item.logo ? (
                <img src={item.logo} className="w-16 h-16 rounded-2xl object-contain bg-neutral-50 p-2 shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-neutral-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900">{item.name}</h3>
                <p className="text-xs text-neutral-500 line-clamp-2">{item.bio}</p>
              </div>
            </div>
            {item.photo && (
              <div className="aspect-video rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100">
                <img src={item.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            {showMessages && (item.message || item.final_message) && (
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 border-l-4 border-l-neutral-900">
                <p className="text-sm italic text-neutral-600">"{item.message || item.final_message}"</p>
              </div>
            )}
            {item.socials && (
              <div className="border-t border-neutral-100 pt-2">
                <SocialLinks 
                  instagram={item.socials.instagram}
                  whatsapp={item.socials.whatsapp}
                  website={item.socials.website}
                  buttonClassName="p-2 bg-neutral-50 rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
