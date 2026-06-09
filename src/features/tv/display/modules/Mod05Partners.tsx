import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Partner, PartnerType } from '../../../../types';
import type { TvTheme } from '../theme';

const TYPE_LABEL: Record<PartnerType, string> = {
  patrocinador: 'Patrocinador',
  apoiador: 'Apoiador',
  servico: 'Parceiro',
};

/**
 * MOD-05 · Patrocinadores / Parceiros — um parceiro por slide.
 * Recebe os parceiros com show_on_tv = true (ordenados por order_index,
 * resolvidos no TVDisplay). Percorre a lista a cada `perSlide` segundos.
 */
export default function Mod05Partners({
  partners, theme, perSlide,
}: {
  partners: Partner[]; theme: TvTheme; perSlide: number;
}) {
  const [idx, setIdx] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (partners.length <= 1) return;
    const t = setInterval(() => setIdx((i) => i + 1), Math.max(4, perSlide) * 1000);
    return () => clearInterval(t);
  }, [partners.length, perSlide]);

  if (partners.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <span className="text-7xl">🤝</span>
        <p style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-4xl">
          Quem apoia este evento
        </p>
      </div>
    );
  }

  const p = partners[(startRef.current + idx) % partners.length];
  const image = p.logo_url || p.photos?.[0] || '';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 py-10 overflow-hidden">
      <span
        style={{ fontFamily: theme.fontHand, color: theme.inkSoft }}
        className="text-5xl mb-6"
      >
        Um obrigado especial a quem torna tudo possível ✦
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 110, damping: 18 }}
          className="flex flex-col items-center"
        >
          <span
            style={{ fontFamily: theme.fontBody, background: theme.accent, color: theme.frame }}
            className="px-6 py-2 rounded-full text-2xl uppercase tracking-widest shadow-lg mb-6"
          >
            {TYPE_LABEL[p.type]}
          </span>

          <div
            className="shadow-2xl flex items-center justify-center"
            style={{ background: theme.frame, padding: '40px', borderRadius: 18, minWidth: '40vw', minHeight: '46vh' }}
          >
            {image ? (
              <img
                src={image}
                alt={p.name}
                className="object-contain"
                style={{ maxWidth: '46vw', maxHeight: '40vh' }}
              />
            ) : (
              <span style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-7xl text-center px-8">
                {p.name}
              </span>
            )}
          </div>

          {image && (
            <h2 style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-5xl mt-8 text-center">
              {p.name}
            </h2>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
