import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Exhibitor } from '../../../../types';
import type { TvTheme } from '../theme';

/**
 * MOD-04 · Trio de Expositores — 3 expositores por slide (grid).
 * Percorre todos os expositores ativos em grupos de 3 (round-robin),
 * avançando de grupo a cada `perSlide` segundos.
 */
export default function Mod04Trio({
  exhibitors, theme, perSlide,
}: {
  exhibitors: Exhibitor[]; theme: TvTheme; perSlide: number;
}) {
  // Quebra em grupos de 3
  const groups: Exhibitor[][] = [];
  for (let i = 0; i < exhibitors.length; i += 3) groups.push(exhibitors.slice(i, i + 3));

  const [idx, setIdx] = useState(0);
  const startRef = useRef(Math.floor(Math.random() * Math.max(1, groups.length)));

  useEffect(() => {
    if (groups.length <= 1) return;
    const t = setInterval(() => setIdx((i) => i + 1), Math.max(4, perSlide) * 1000);
    return () => clearInterval(t);
  }, [groups.length, perSlide]);

  if (exhibitors.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <span className="text-7xl">🏪</span>
        <p style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-4xl">
          Nossos estandes
        </p>
      </div>
    );
  }

  const group = groups[(startRef.current + idx) % groups.length];

  return (
    <div className="w-full h-full flex flex-col px-16 py-10">
      <header className="shrink-0 mb-8 flex items-end gap-4">
        <h1 style={{ fontFamily: theme.fontDisplay, color: theme.accent }} className="text-6xl leading-none">
          Visite os Estandes
        </h1>
        <span style={{ fontFamily: theme.fontHand, color: theme.inkSoft }} className="text-4xl mb-1">
          passe em todos ✦
        </span>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-10 min-h-0">
        <AnimatePresence mode="wait">
          {group.map((ex, i) => {
            const image = ex.photo_url || ex.logo_url || '';
            return (
              <motion.div
                key={`${idx}-${ex.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 120, damping: 18 }}
                className="flex items-center justify-center min-h-0"
              >
                <div
                  className="shadow-2xl w-full max-w-[26vw]"
                  style={{ background: theme.frame, padding: '16px 16px 0', borderRadius: 6, transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
                >
                  <div className="relative w-full aspect-square flex items-center justify-center">
                    {image ? (
                      <img src={image} alt={ex.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: theme.paper }}>
                        <span style={{ fontFamily: theme.fontDisplay, color: theme.inkSoft }} className="text-6xl">
                          {ex.name?.[0] ?? '★'}
                        </span>
                      </div>
                    )}
                    <div
                      className="absolute -top-4 -left-4 px-4 h-12 rounded-full flex items-center justify-center text-xl shadow"
                      style={{ background: theme.ink, color: theme.frame, fontFamily: theme.fontDisplay }}
                    >
                      Nº {ex.number}
                    </div>
                  </div>
                  <div className="px-2 py-4">
                    <h3 style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-3xl leading-none truncate">
                      {ex.name}
                    </h3>
                    <p style={{ fontFamily: theme.fontHand, color: theme.accent }} className="text-3xl leading-tight mt-1 truncate">
                      {ex.tagline || ex.category}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
