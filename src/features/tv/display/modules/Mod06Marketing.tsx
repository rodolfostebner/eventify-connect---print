import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { TvTheme } from '../theme';
import type { MarketingPhoto } from '../../../../services/marketingService';

/**
 * MOD-06 · Marketing do Evento — slides de imagens do organizador.
 * Cada slide pode ter só foto, foto + frase, ou foto + frase + texto.
 * A imagem ocupa a tela; quando há frase/texto, um bloco semitransparente
 * aparece na base. Percorre as fotos a cada `perSlide` segundos.
 */
export default function Mod06Marketing({
  photos, theme, perSlide,
}: {
  photos: MarketingPhoto[]; theme: TvTheme; perSlide: number;
}) {
  const [idx, setIdx] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const t = setInterval(() => setIdx((i) => i + 1), Math.max(4, perSlide) * 1000);
    return () => clearInterval(t);
  }, [photos.length, perSlide]);

  if (photos.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <span className="text-7xl">📣</span>
        <p style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-4xl">
          Fique ligado nas novidades
        </p>
      </div>
    );
  }

  const photo = photos[(startRef.current + idx) % photos.length];
  const hasText = Boolean(photo.phrase || photo.text);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img src={photo.image_url} alt="" className="w-full h-full object-cover" />

          {hasText && (
            <div
              className="absolute inset-x-0 bottom-0 p-12 flex flex-col gap-3"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)' }}
            >
              {photo.phrase && (
                <motion.h2
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ fontFamily: theme.fontDisplay, color: '#ffffff' }}
                  className="text-7xl leading-[1.05] drop-shadow-lg"
                >
                  {photo.phrase}
                </motion.h2>
              )}
              {photo.text && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  style={{ fontFamily: theme.fontBody, color: 'rgba(255,255,255,0.92)' }}
                  className="text-3xl leading-snug max-w-5xl drop-shadow"
                >
                  {photo.text}
                </motion.p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
