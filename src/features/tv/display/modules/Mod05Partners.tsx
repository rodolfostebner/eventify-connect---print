import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Partner, PartnerType } from '../../../../types';
import type { TvTheme } from '../theme';

const TYPE_LABEL: Record<PartnerType, string> = {
  patrocinador: 'Patrocinador',
  apoiador: 'Apoiador',
  servico: 'Parceiro',
};

// Acima desta razão (largura/altura) a foto é considerada "larga" e ocupa o
// quadro sozinha; abaixo disso, duas fotos cabem lado a lado.
const WIDE_RATIO = 1.25;

// Um slide = um parceiro com 1 ou 2 fotos (2 só quando ambas couberem).
export interface PartnerSlide {
  partner: Partner;
  images: string[]; // 1 ou 2 imagens; vazio = só logo/nome
}

/**
 * Monta as telas do MOD-05 a partir dos parceiros: duas fotos por tela quando
 * couberem (retrato/quadrada), uma quando a foto for larga. Compartilhado com
 * o TVDisplay, que usa slides.length para reservar o tempo do módulo na
 * rotação (duração configurada × nº de telas reais).
 */
export function usePartnerSlides(partners: Partner[]): PartnerSlide[] {
  // Razão de aspecto (largura/altura) de cada foto, medida ao carregar.
  const [ratios, setRatios] = useState<Record<string, number>>({});

  // Pré-carrega as fotos para medir a proporção e decidir o empacotamento.
  useEffect(() => {
    let active = true;
    const urls = partners.flatMap((p) => (p.photos ?? []).filter(Boolean));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partners]);

  // Monta os slides: enquanto não souber a proporção, trata como "larga" (1 por slide).
  return useMemo<PartnerSlide[]>(() => {
    const isWide = (url: string) => (ratios[url] ?? 99) >= WIDE_RATIO;
    const out: PartnerSlide[] = [];
    partners.forEach((p) => {
      const photos = (p.photos ?? []).filter(Boolean);
      if (photos.length === 0) {
        out.push({ partner: p, images: [] });
        return;
      }
      let i = 0;
      while (i < photos.length) {
        const a = photos[i];
        const b = photos[i + 1];
        if (b && !isWide(a) && !isWide(b)) {
          out.push({ partner: p, images: [a, b] });
          i += 2;
        } else {
          out.push({ partner: p, images: [a] });
          i += 1;
        }
      }
    });
    return out;
  }, [partners, ratios]);
}

/**
 * MOD-05 · Patrocinadores / Parceiros.
 * Cabeçalho: logo ao lado do nome + tipo. Quadro central: fotos do parceiro,
 * duas de cada vez quando couberem (retrato/quadrada) ou uma quando a foto for
 * larga. À direita, a descrição do parceiro. Abaixo, chamada para o app.
 * Recebe os slides prontos (usePartnerSlides no TVDisplay).
 */
export default function Mod05Partners({
  slides, theme, perSlide,
}: {
  slides: PartnerSlide[]; theme: TvTheme; perSlide: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => i + 1), Math.max(4, perSlide) * 1000);
    return () => clearInterval(t);
  }, [slides.length, perSlide]);

  if (slides.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <span className="text-7xl">🤝</span>
        <p style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-4xl">
          Quem apoia este evento
        </p>
      </div>
    );
  }

  const slide = slides[idx % slides.length];
  const { partner: p } = slide;
  const centerImages = slide.images.length > 0 ? slide.images : (p.logo_url ? [p.logo_url] : []);
  const single = centerImages.length <= 1;

  return (
    <div className="w-full h-full flex flex-col items-center px-16 py-6 overflow-hidden">
      <span style={{ fontFamily: theme.fontHand, color: theme.inkSoft }} className="text-4xl mb-3">
        Um obrigado especial aos nossos apoiadores ✦
      </span>

      {/* Cabeçalho: logo ao lado do nome + tipo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-5 mb-4"
        >
          {p.logo_url && (
            <div
              className="shrink-0 flex items-center justify-center rounded-2xl shadow-lg"
              style={{ background: theme.frame, width: '11vh', height: '11vh', padding: '10px' }}
            >
              <img src={p.logo_url} alt={p.name} className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <div className="flex flex-col">
            <span
              style={{ fontFamily: theme.fontBody, background: theme.accent, color: theme.frame }}
              className="self-start px-4 py-1 rounded-full text-xl uppercase tracking-widest shadow mb-1"
            >
              {TYPE_LABEL[p.type]}
            </span>
            <h2 style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-5xl leading-none">
              {p.name}
            </h2>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Corpo: fotos (ampliadas) + descrição à direita */}
      <div className="flex-1 w-full min-h-0 flex items-stretch justify-center gap-8">
        {/* Fotos — container query: as molduras se limitam ao espaço real deste quadro */}
        <div className="flex-1 min-h-0 flex items-center justify-center gap-6" style={{ containerType: 'size' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${p.id}-${slide.images.join('|') || 'logo'}-${idx}`}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 110, damping: 18 }}
              className="w-full h-full flex items-center justify-center gap-6"
            >
              {centerImages.length > 0 ? (
                centerImages.map((src) => (
                  <div
                    key={src}
                    className="shadow-2xl flex items-center justify-center"
                    style={{ background: theme.frame, padding: '20px', borderRadius: 18 }}
                  >
                    <img
                      src={src}
                      alt={p.name}
                      className="object-contain"
                      style={{
                        // 40px = padding da moldura; 52px = padding + metade do gap entre as duas molduras
                        maxHeight: 'min(60vh, 100cqh - 40px)',
                        maxWidth: single
                          ? (p.description ? 'min(40vw, 100cqw - 40px)' : 'min(60vw, 100cqw - 40px)')
                          : 'calc(50cqw - 52px)',
                      }}
                    />
                  </div>
                ))
              ) : (
                <span style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-7xl text-center px-12 py-16">
                  {p.name}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Descrição do parceiro */}
        {p.description && (
          <div className="shrink-0 w-[26vw] flex items-center">
            <p
              style={{ fontFamily: theme.fontBody, color: theme.ink }}
              className="text-3xl leading-snug whitespace-pre-line"
            >
              {p.description}
            </p>
          </div>
        )}
      </div>

      {/* Chamada para o app */}
      <p style={{ fontFamily: theme.fontBody, color: theme.inkSoft }} className="text-2xl mt-4 text-center">
        Acesse nosso app <strong style={{ color: theme.accent }}>memorieshub.com.br</strong> para ter mais detalhes e dados de contato.
      </p>
    </div>
  );
}
