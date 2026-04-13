import React from 'react';
import { Instagram, Globe, Phone } from 'lucide-react';
import { formatInstagram, formatWhatsApp, formatWebsite } from '../../../utils/formatters';

interface SocialLinksProps {
  instagram?: string;
  whatsapp?: string;
  website?: string;
  containerClassName?: string;
  buttonClassName?: string;
}

export function SocialLinks({ 
  instagram, 
  whatsapp, 
  website, 
  containerClassName = "flex gap-2 pt-2",
  buttonClassName = "p-2 bg-white rounded-lg shadow-sm transition-colors"
}: SocialLinksProps) {
  if (!instagram && !whatsapp && !website) return null;

  return (
    <div className={containerClassName}>
      {instagram && (
        <a href={formatInstagram(instagram)} target="_blank" rel="noopener noreferrer" className={`${buttonClassName} hover:text-pink-600`}>
          <Instagram className="w-4 h-4" />
        </a>
      )}
      {whatsapp && (
        <a href={formatWhatsApp(whatsapp)} target="_blank" rel="noopener noreferrer" className={`${buttonClassName} hover:text-green-600`}>
          <Phone className="w-4 h-4" />
        </a>
      )}
      {website && (
        <a href={formatWebsite(website)} target="_blank" rel="noopener noreferrer" className={`${buttonClassName} hover:text-blue-600`}>
          <Globe className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
