import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { PhotoData } from '../../../../types';
import type { TvTheme } from '../theme';
import { markPhotoShown } from '../../../../services/tvService';

const PER_SLIDE = 3; // fotos exibidas por vez (visitantes + oficiais)

/**
 * MOD-02 · Carrossel de Fotos — fotos aprovadas em trios, estilo polaroid.
 * Mostra 3 fotos de cada vez (visitantes e oficiais) e avança o grupo a cada
 * `perSlide` segundos. Marca cada foto exibida em tv_photo_history (best-effort).
 */
export default function Mod02Carousel({
  photos, theme, perSlide, eventId,
}: {
  photos: PhotoData[]; theme: TvTheme; perSlide: number; eventId: string;
}) {
  const list = photos.filter((p) => p.status === 'approved');

  // Quebra em grupos de PER_SLIDE
  const groups: PhotoData[][] = [];
  for (let i = 0; i < list.length; i += PER_SLIDE) groups.push(list.slice(i, i + PER_SLIDE));

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (groups.length <= 1) return;
    const t = setInterval(() => setIdx((i) => i + 1), Math.max(3, perSlide) * 1000);
    return () => clearInterval(t);
  }, [groups.length, perSlide]);

  const group = groups.length > 0 ? groups[idx % groups.length] : [];

  // Marca exibição das fotos do grupo atual (best-effort, sem bloquear render)
  useEffect(() => {
    group.forEach((p) => markPhotoShown(eventId, p.id, 'mod02').catch(() => {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, eventId]);

  if (group.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <span className="text-7xl">🖼️</span>
        <p style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-4xl">
          Ainda não há fotos no mural
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center gap-8 px-12 py-10 overflow-hidden">
      <AnimatePresence mode="popLayout">
        {group.map((current, i) => (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.9, rotate: -6, y: 30 }}
            animate={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -1.5 : 1.5, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, rotate: 5, y: -30 }}
            transition={{ type: 'spring', stiffness: 110, damping: 18, delay: i * 0.08 }}
            className="relative"
            style={{ maxHeight: '100%' }}
          >
            {/* Fita adesiva */}
            <div
              className="absolute -top-5 left-1/2 -translate-x-1/2 w-28 h-8 rotate-2 z-10"
              style={{ background: theme.tape }}
            />
            {/* Polaroid */}
            <div
              className="shadow-2xl"
              style={{ background: theme.frame, padding: '16px 16px 0', borderRadius: 6 }}
            >
              <div className="relative" style={{ width: '38vh', height: '38vh', maxWidth: '26vw' }}>
                <img src={current.image_url} alt="" className="w-full h-full object-cover" />
                {current.is_official && (
                  <div
                    className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold shadow"
                    style={{ background: theme.accent, color: theme.frame, fontFamily: theme.fontBody }}
                  >
                    ★ Oficial
                  </div>
                )}
              </div>
              <div className="px-2 py-4 flex items-center justify-between gap-2">
                <span style={{ fontFamily: theme.fontHand, color: theme.accent }} className="text-3xl leading-none truncate">
                  {current.user_name || 'Visitante'}
                </span>
                <span style={{ fontFamily: theme.fontBody, color: theme.inkSoft }} className="text-xl shrink-0">
                  {new Date(current.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
