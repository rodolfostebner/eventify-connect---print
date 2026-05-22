import React from 'react';
import { Instagram, Globe, Phone } from 'lucide-react';
import { formatInstagram, formatWhatsApp, formatWebsite } from '../../../utils/formatters';

export type SocialLinkType = 'instagram' | 'whatsapp' | 'website';

interface SocialLinksProps {
  instagram?: string;
  whatsapp?: string;
  website?: string;
  containerClassName?: string;
  buttonClassName?: string;
  // Callback opcional disparado no clique (fire-and-forget); nunca aguarda.
  onLinkClick?: (type: SocialLinkType) => void;
}

export function SocialLinks({
  instagram,
  whatsapp,
  website,
  containerClassName = "flex gap-2 pt-2",
  buttonClassName = "p-2 bg-white rounded-lg shadow-sm transition-colors",
  onLinkClick,
}: SocialLinksProps) {
  if (!instagram && !whatsapp && !website) return null;

  return (
    <div className={containerClassName}>
      {instagram && (
        <a
          href={formatInstagram(instagram)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick ? () => onLinkClick('instagram') : undefined}
          className={`${buttonClassName} hover:text-pink-600`}
        >
          <Instagram className="w-4 h-4" />
        </a>
      )}
      {whatsapp && (
        <a
          href={formatWhatsApp(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick ? () => onLinkClick('whatsapp') : undefined}
          className={`${buttonClassName} hover:text-green-600`}
        >
          <Phone className="w-4 h-4" />
        </a>
      )}
      {website && (
        <a
          href={formatWebsite(website)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick ? () => onLinkClick('website') : undefined}
          className={`${buttonClassName} hover:text-blue-600`}
        >
          <Globe className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
