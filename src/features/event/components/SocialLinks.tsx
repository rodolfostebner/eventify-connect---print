import { Globe, Phone, Mail, Music2, Youtube } from 'lucide-react';
import {
  formatInstagram, formatWhatsApp, formatWebsite,
  formatTiktok, formatYoutube, formatEmail, formatPhone,
} from '../../../utils/formatters';
import { WhatsAppIcon, InstagramIcon } from './BrandIcons';

export type SocialLinkType = 'instagram' | 'tiktok' | 'youtube' | 'whatsapp' | 'website' | 'email' | 'phone';

interface SocialLinksProps {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  whatsapp?: string;
  website?: string;
  email?: string;
  phone?: string;
  containerClassName?: string;
  buttonClassName?: string;
  // Callback opcional disparado no clique (fire-and-forget); nunca aguarda.
  onLinkClick?: (type: SocialLinkType) => void;
}

export function SocialLinks({
  instagram,
  tiktok,
  youtube,
  whatsapp,
  website,
  email,
  phone,
  containerClassName = "flex gap-2 pt-2 flex-wrap",
  buttonClassName = "p-2 bg-white rounded-lg shadow-sm transition-colors",
  onLinkClick,
}: SocialLinksProps) {
  if (!instagram && !tiktok && !youtube && !whatsapp && !website && !email && !phone) return null;

  const links: { type: SocialLinkType; show?: string; href: string; icon: React.ReactNode; hover: string }[] = [
    { type: 'instagram', show: instagram, href: formatInstagram(instagram), icon: <InstagramIcon className="w-4 h-4" />, hover: 'hover:text-pink-600' },
    { type: 'tiktok', show: tiktok, href: formatTiktok(tiktok), icon: <Music2 className="w-4 h-4" />, hover: 'hover:text-neutral-900' },
    { type: 'youtube', show: youtube, href: formatYoutube(youtube), icon: <Youtube className="w-4 h-4" />, hover: 'hover:text-red-600' },
    { type: 'whatsapp', show: whatsapp, href: formatWhatsApp(whatsapp), icon: <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />, hover: 'hover:text-green-600' },
    { type: 'website', show: website, href: formatWebsite(website), icon: <Globe className="w-4 h-4" />, hover: 'hover:text-blue-600' },
    { type: 'email', show: email, href: formatEmail(email), icon: <Mail className="w-4 h-4" />, hover: 'hover:text-amber-600' },
    { type: 'phone', show: phone, href: formatPhone(phone), icon: <Phone className="w-4 h-4" />, hover: 'hover:text-emerald-600' },
  ];

  return (
    <div className={containerClassName}>
      {links.filter(l => l.show && l.href).map(l => (
        <a
          key={l.type}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick ? () => onLinkClick(l.type) : undefined}
          className={`${buttonClassName} ${l.hover}`}
        >
          {l.icon}
        </a>
      ))}
    </div>
  );
}
