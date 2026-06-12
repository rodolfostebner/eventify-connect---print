import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Exhibitor } from '../../../../types';
import { tvImageFor, type TvTheme } from '../theme';

/**
 * MOD-03 · Expositor Destaque — um expositor por slide.
 * Recebe apenas os expositores marcados como destaque agora
 * (tv_exhibitor_spotlight com ended_at IS NULL, resolvidos no TVDisplay).
 * Percorre a lista internamente a cada `perSlide` segundos.
 */
export default function Mod03Spotlight({
  exhibitors, theme, perSlide,
}: {
  exhibitors: Exhibitor[]; theme: TvTheme; perSlide: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (exhibitors.length <= 1) return;
    const t = setInterval(() => setIdx((i) => i + 1), Math.max(4, perSlide) * 1000);
    return () => clearInterval(t);
  }, [exhibitors.length, perSlide]);

  if (exhibitors.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <span className="text-7xl">⭐</span>
        <p style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-4xl">
          Conheça nossos estandes
        </p>
      </div>
    );
  }

  const ex = exhibitors[idx % exhibitors.length];
  const image = tvImageFor(ex);

  return (
    <div className="w-full h-full flex items-center justify-center px-16 py-10 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={ex.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ type: 'spring', stiffness: 110, damping: 18 }}
          className="w-full h-full grid grid-cols-12 gap-12 items-center"
        >
          {/* Foto / logo em polaroid */}
          <div className="col-span-6 flex items-center justify-center min-h-0">
            <div className="relative">
              <div
                className="absolute -top-5 left-1/2 -translate-x-1/2 w-44 h-9 rotate-2 z-10"
                style={{ background: theme.tape }}
              />
              <div className="shadow-2xl" style={{ background: theme.frame, padding: '20px 20px 0', borderRadius: 6, transform: 'rotate(-2deg)' }}>
                <div className="relative flex items-center justify-center" style={{ width: '52vh', height: '52vh', maxWidth: '42vw' }}>
                  {image ? (
                    <img src={image} alt={ex.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: theme.paper }}>
                      <span style={{ fontFamily: theme.fontDisplay, color: theme.inkSoft }} className="text-7xl">
                        {ex.name?.[0] ?? '★'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-2 py-4 flex items-center gap-3">
                  <span className="text-3xl">⭐</span>
                  <span style={{ fontFamily: theme.fontHand, color: theme.accent }} className="text-4xl leading-none">
                    Estande em destaque
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Texto */}
          <div className="col-span-6 flex flex-col gap-5 pr-8">
            <span style={{ fontFamily: theme.fontBody, color: theme.inkSoft }} className="text-2xl uppercase tracking-widest">
              Estande Nº {ex.number} · {ex.category}
            </span>
            <h1 style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-7xl leading-[1.05]">
              {ex.name}
            </h1>
            {ex.tagline && (
              <p style={{ fontFamily: theme.fontHand, color: theme.accent2 }} className="text-5xl leading-tight">
                {ex.tagline}
              </p>
            )}
            {ex.description && (
              <p style={{ fontFamily: theme.fontBody, color: theme.inkSoft }} className="text-2xl leading-snug line-clamp-3 whitespace-pre-line">
                {ex.description}
              </p>
            )}
            <ContactRow theme={theme} exhibitor={ex} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ContactRow({ theme, exhibitor }: { theme: TvTheme; exhibitor: Exhibitor }) {
  const chips: { icon: string; label: string }[] = [];
  if (exhibitor.instagram_url) chips.push({ icon: '📷', label: cleanHandle(exhibitor.instagram_url) });
  if (exhibitor.whatsapp) chips.push({ icon: '💬', label: 'WhatsApp' });
  if (exhibitor.website_url) chips.push({ icon: '🌐', label: cleanDomain(exhibitor.website_url) });
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {chips.map((c, i) => (
        <span
          key={i}
          style={{ fontFamily: theme.fontBody, background: theme.frame, color: theme.ink }}
          className="px-5 py-2 rounded-full text-2xl shadow flex items-center gap-2"
        >
          <span>{c.icon}</span> {c.label}
        </span>
      ))}
    </div>
  );
}

function cleanHandle(url: string): string {
  const handle = url.replace(/\/+$/, '').split('/').pop() || url;
  return handle.startsWith('@') ? handle : `@${handle}`;
}

function cleanDomain(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
}
