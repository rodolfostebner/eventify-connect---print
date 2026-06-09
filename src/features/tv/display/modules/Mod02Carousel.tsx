import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { PhotoData } from '../../../../types';
import type { TvTheme } from '../theme';
import { markPhotoShown } from '../../../../services/tvService';

/**
 * MOD-02 · Carrossel de Fotos — fotos aprovadas, uma por vez, estilo polaroid.
 * Avança um slide a cada `perSlide` segundos. Marca cada foto exibida em
 * tv_photo_history (best-effort) para o painel de controle acompanhar a cobertura.
 */
export default function Mod02Carousel({
  photos, theme, perSlide, eventId,
}: {
  photos: PhotoData[]; theme: TvTheme; perSlide: number; eventId: string;
}) {
  const [idx, setIdx] = useState(0);
  const startRef = useRef(Math.floor(Math.random() * Math.max(1, photos.length)));

  // Ordena: oficiais ganham um leve destaque aparecendo intercaladas
  const list = photos.filter((p) => p.status === 'approved');

  useEffect(() => {
    if (list.length <= 1) return;
    const t = setInterval(() => setIdx((i) => i + 1), Math.max(3, perSlide) * 1000);
    return () => clearInterval(t);
  }, [list.length, perSlide]);

  const current = list.length > 0 ? list[(startRef.current + idx) % list.length] : null;

  // Marca exibição (best-effort, sem bloquear render)
  useEffect(() => {
    if (current) markPhotoShown(eventId, current.id, 'mod02').catch(() => {});
  }, [current?.id, eventId]);

  if (!current) {
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
    <div className="w-full h-full flex items-center justify-center px-16 py-10 overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 0.9, rotate: -6, y: 30 }}
          animate={{ opacity: 1, scale: 1, rotate: -1.5, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, rotate: 5, y: -30 }}
          transition={{ type: 'spring', stiffness: 110, damping: 18 }}
          className="relative"
          style={{ maxHeight: '100%' }}
        >
          {/* Fita adesiva */}
          <div
            className="absolute -top-5 left-1/2 -translate-x-1/2 w-40 h-9 rotate-2 z-10"
            style={{ background: theme.tape }}
          />
          {/* Polaroid */}
          <div
            className="shadow-2xl"
            style={{ background: theme.frame, padding: '20px 20px 0', borderRadius: 6 }}
          >
            <div className="relative" style={{ width: '58vh', height: '58vh', maxWidth: '46vw' }}>
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
            <div className="px-2 py-5 flex items-center justify-between">
              <span style={{ fontFamily: theme.fontHand, color: theme.accent }} className="text-4xl leading-none">
                {current.user_name || 'Visitante'}
              </span>
              <span style={{ fontFamily: theme.fontBody, color: theme.inkSoft }} className="text-2xl">
                {new Date(current.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
