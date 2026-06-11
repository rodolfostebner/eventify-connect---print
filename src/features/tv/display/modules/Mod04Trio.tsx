import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Exhibitor } from '../../../../types';
import { tvImageFor, type TvTheme } from '../theme';

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

  const group = groups[idx % groups.length];

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
            const image = tvImageFor(ex);
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
                  className="shadow-2xl"
                  style={{ background: theme.frame, padding: '16px 16px 0', borderRadius: 6, transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`, maxWidth: '26vw' }}
                >
                  <div className="relative flex items-center justify-center overflow-hidden" style={{ background: theme.paper }}>
                    {image ? (
                      // A moldura acompanha a foto: altura reservada fixa, largura conforme
                      // a proporção — sem cortar a imagem e sem sobrar espaço nas laterais.
                      <img
                        src={image}
                        alt={ex.name}
                        className="block object-contain"
                        style={{ height: 'auto', width: 'auto', maxHeight: '50vh', maxWidth: '26vw' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center" style={{ height: '50vh', width: '50vh', maxWidth: '26vw' }}>
                        <span style={{ fontFamily: theme.fontDisplay, color: theme.inkSoft }} className="text-6xl">
                          {ex.name?.[0] ?? '★'}
                        </span>
                      </div>
                    )}
                    {/* Categoria do expositor no canto superior esquerdo */}
                    {ex.category && (
                      <span
                        style={{ background: theme.ink, color: theme.frame, fontFamily: theme.fontDisplay }}
                        className="absolute top-3 left-3 inline-flex items-center px-3 py-1 rounded-md text-xl shadow max-w-[55%]"
                      >
                        <span className="truncate">{ex.category}</span>
                      </span>
                    )}
                    {/* Ano + turma no canto superior direito da foto */}
                    {(ex.ano || ex.turma) && (
                      <span
                        style={{ background: theme.accent, color: theme.frame, fontFamily: theme.fontBody }}
                        className="absolute top-3 right-3 inline-flex items-center gap-2 px-3 py-1 rounded-md text-xl shadow max-w-[55%]"
                      >
                        {ex.ano && <span>{ex.ano}</span>}
                        {ex.ano && ex.turma && <span className="opacity-60">·</span>}
                        {ex.turma && <span className="truncate">Turma {ex.turma}</span>}
                      </span>
                    )}
                  </div>
                  <div className="px-2 pt-4 pb-6 flex flex-col gap-2">
                    <h3 style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-3xl leading-snug truncate">
                      {ex.name}
                    </h3>
                    {/* Frase de chamada do expositor */}
                    {ex.tagline && (
                      <p style={{ fontFamily: theme.fontHand, color: theme.accent }} className="text-3xl leading-snug truncate">
                        {ex.tagline}
                      </p>
                    )}
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
