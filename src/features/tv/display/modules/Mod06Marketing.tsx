import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData } from '../../../../types';
import type { TvTheme } from '../theme';
import type { MarketingPhoto } from '../../../../services/marketingService';

// Linhas fixas da mensagem de boas-vindas (a 1ª linha usa o nome do evento).
const WELCOME_LINES = [
  'Obrigado pelo apoio aos nossos empreendedores!',
  'Acesse o app do evento em www.memorieshub.com.br',
  'Consulte expositores, produtos, avalie e poste suas fotos.',
  'Suas fotos aparecerão nos telões do evento!',
  'Avalie ao menos 1 expositor e concorra a prêmios.',
];

// Imagem de boas-vindas: "Foto de Capa do Evento" (aba Aparência) = owner_photo.
function welcomeImageOf(event: EventData): string | null {
  return event.owner_photo || null;
}

type Slide =
  | { kind: 'welcome' }
  | { kind: 'photo'; photo: MarketingPhoto };

/**
 * MOD-06 · Marketing do Evento.
 * A primeira página é a tela de boas-vindas: imagem do evento à esquerda e a
 * mensagem de boas-vindas à direita. Em seguida, os slides de marketing do
 * organizador (foto, foto + frase, ou foto + frase + texto). Percorre a cada
 * `perSlide` segundos.
 */
export default function Mod06Marketing({
  photos, theme, perSlide, event,
}: {
  photos: MarketingPhoto[]; theme: TvTheme; perSlide: number; event: EventData;
}) {
  const welcomeImage = welcomeImageOf(event);

  const slides = useMemo<Slide[]>(() => {
    const out: Slide[] = [{ kind: 'welcome' }];
    photos.forEach((photo) => out.push({ kind: 'photo', photo }));
    return out;
  }, [photos]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => i + 1), Math.max(4, perSlide) * 1000);
    return () => clearInterval(t);
  }, [slides.length, perSlide]);

  const slide = slides[idx % slides.length];

  // ─── Slide de boas-vindas ─────────────────────────────────────────────────
  if (slide.kind === 'welcome') {
    return (
      <div className="w-full h-full flex items-center justify-center gap-12 px-16 py-10 overflow-hidden">
        {welcomeImage && (
          <motion.div
            key="welcome-img"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="shrink-0 shadow-2xl flex items-center justify-center"
            style={{ background: theme.frame, padding: '20px', borderRadius: 18, maxHeight: '100%' }}
          >
            <img
              src={welcomeImage}
              alt={event.name}
              className="object-contain"
              style={{ maxHeight: '74vh', maxWidth: '42vw' }}
            />
          </motion.div>
        )}

        <motion.div
          key="welcome-text"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 min-w-0 flex flex-col gap-4"
        >
          <h2 style={{ fontFamily: theme.fontDisplay, color: theme.accent }} className="text-6xl leading-tight">
            Sejam bem-vindos à {event.name}
          </h2>
          <div className="flex flex-col gap-2">
            {WELCOME_LINES.map((line) => (
              <p key={line} style={{ fontFamily: theme.fontBody, color: theme.ink }} className="text-3xl leading-snug">
                {line}
              </p>
            ))}
          </div>
          <span style={{ fontFamily: theme.fontHand, color: theme.accent }} className="text-5xl mt-2">
            Participe! ✦
          </span>
        </motion.div>
      </div>
    );
  }

  // ─── Slides de marketing ──────────────────────────────────────────────────
  const photo = slide.photo;
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
