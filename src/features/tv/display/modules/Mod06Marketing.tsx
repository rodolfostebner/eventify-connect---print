import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData } from '../../../../types';
import type { TvTheme } from '../theme';
import type { MarketingPhoto, MarketingContact } from '../../../../services/marketingService';

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

export type Slide =
  | { kind: 'welcome' }
  | { kind: 'split'; photo: MarketingPhoto }
  | { kind: 'single-photo'; photo: MarketingPhoto; isWide: boolean }
  | { kind: 'double-photo'; photos: MarketingPhoto[] };

/**
 * Hook de medição e empacotamento dos slides de marketing.
 * Agrupa duas fotos do formato Retrato consecutivas e sem frase na mesma tela.
 */
export function useMarketingSlides(photos: MarketingPhoto[]): Slide[] {
  const [ratios, setRatios] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    const urls = photos.map((p) => p.image_url).filter(Boolean);
    urls.forEach((url) => {
      if (ratios[url]) return;
      const img = new Image();
      img.onload = () => {
        if (!active) return;
        setRatios((r) => (r[url] ? r : { ...r, [url]: img.naturalWidth / Math.max(1, img.naturalHeight) }));
      };
      img.src = url;
    });
    return () => { active = false; };
  }, [photos]);

  return useMemo<Slide[]>(() => {
    const out: Slide[] = [{ kind: 'welcome' }];
    const isWide = (url: string) => (ratios[url] ?? 1.3) >= 1.0;

    let i = 0;
    while (i < photos.length) {
      const p = photos[i];
      const hasText = Boolean(p.phrase || p.text);

      if (hasText) {
        out.push({ kind: 'split', photo: p });
        i++;
      } else {
        const currentIsWide = isWide(p.image_url);
        if (currentIsWide) {
          out.push({ kind: 'single-photo', photo: p, isWide: true });
          i++;
        } else {
          const next = photos[i + 1];
          const nextHasText = next ? Boolean(next.phrase || next.text) : true;
          const nextIsWide = next ? isWide(next.image_url) : true;

          if (next && !nextHasText && !nextIsWide) {
            out.push({ kind: 'double-photo', photos: [p, next] });
            i += 2;
          } else {
            out.push({ kind: 'single-photo', photo: p, isWide: false });
            i++;
          }
        }
      }
    }
    return out;
  }, [photos, ratios]);
}

/**
 * Exibe os canais de contatos do marketing cadastrados no banco
 */
function MarketingContactRow({ theme, contact }: { theme: TvTheme; contact: MarketingContact | null }) {
  if (!contact) return null;
  const chips: { icon: string; label: string }[] = [];
  if (contact.instagram) chips.push({ icon: '📷', label: contact.instagram });
  if (contact.phone) chips.push({ icon: '💬', label: contact.phone });
  if (contact.email) chips.push({ icon: '✉️', label: contact.email });
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-4 mt-2">
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

/**
 * MOD-06 · Marketing do Evento.
 * Gerencia a renderização de acordo com a variante do slide:
 * - welcome: boas-vindas com imagem na esquerda e texto fixo na direita (sem contatos).
 * - split: slide de marketing com frase e texto de chamada (split layout + contatos no rodapé).
 * - single-photo: foto individual centralizada (sem frase/texto, sem contatos).
 * - double-photo: duas fotos retrato lado a lado (sem frase/texto, sem contatos).
 */
export default function Mod06Marketing({
  slides, theme, perSlide, event, contact,
}: {
  slides: Slide[]; theme: TvTheme; perSlide: number; event: EventData; contact: MarketingContact | null;
}) {
  const welcomeImage = welcomeImageOf(event);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => i + 1), Math.max(4, perSlide) * 1000);
    return () => clearInterval(t);
  }, [slides.length, perSlide]);

  if (slides.length === 0) return null;
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
          <div className="flex flex-col gap-3 mt-1">
            <span style={{ fontFamily: theme.fontHand, color: theme.accent }} className="text-5xl">
              Participe! ✦
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Slides customizados divididos com Frase (Split) ─────────────────────
  if (slide.kind === 'split') {
    const { photo } = slide;
    return (
      <div className="w-full h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center gap-12 px-16 py-10 overflow-hidden"
          >
            {/* Foto na esquerda */}
            <div
              className="shrink-0 shadow-2xl flex items-center justify-center"
              style={{ background: theme.frame, padding: '20px', borderRadius: 18, maxHeight: '100%' }}
            >
              <img
                src={photo.image_url}
                alt=""
                className="object-contain"
                style={{ maxHeight: '74vh', maxWidth: '42vw' }}
              />
            </div>

            {/* Chamada e contatos na direita */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {photo.phrase && (
                <h2 style={{ fontFamily: theme.fontDisplay, color: theme.accent }} className="text-6xl leading-tight">
                  {photo.phrase}
                </h2>
              )}
              {photo.text && (
                <p style={{ fontFamily: theme.fontBody, color: theme.ink }} className="text-3xl leading-snug">
                  {photo.text}
                </p>
              )}
              <MarketingContactRow theme={theme} contact={contact} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── Slide de foto única centralizada sem Frase (Paisagem ou Retrato único) ───
  if (slide.kind === 'single-photo') {
    const { photo, isWide } = slide;
    return (
      <div className="w-full h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center px-16 py-10 overflow-hidden"
          >
            <div
              className="shadow-2xl flex items-center justify-center"
              style={{ background: theme.frame, padding: '20px', borderRadius: 18, maxHeight: '100%' }}
            >
              <img
                src={photo.image_url}
                alt=""
                className="object-contain"
                style={{
                  maxHeight: '74vh',
                  maxWidth: isWide ? '75vw' : '42vw',
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── Slide de duas fotos retrato sem Frase lado a lado ─────────────────────
  if (slide.kind === 'double-photo') {
    const { photos: list } = slide;
    return (
      <div className="w-full h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={list.map((p) => p.id).join('|')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center gap-12 px-16 py-10 overflow-hidden"
          >
            {list.map((photo) => (
              <div
                key={photo.id}
                className="shadow-2xl flex items-center justify-center"
                style={{ background: theme.frame, padding: '20px', borderRadius: 18, maxHeight: '100%' }}
              >
                <img
                  src={photo.image_url}
                  alt=""
                  className="object-contain"
                  style={{ maxHeight: '74vh', maxWidth: '38vw' }}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
