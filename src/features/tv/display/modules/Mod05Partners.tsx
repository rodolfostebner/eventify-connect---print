import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Partner, PartnerType } from '../../../../types';
import type { TvTheme } from '../theme';

const TYPE_LABEL: Record<PartnerType, string> = {
  patrocinador: 'Patrocinador',
  apoiador: 'Apoiador',
  servico: 'Parceiro',
};

// Um quadro = uma foto de um parceiro. Parceiro sem foto cai numa entrada
// única (mostra o logo no quadro central).
interface Frame {
  partner: Partner;
  image: string | null;
}

/**
 * MOD-05 · Patrocinadores / Parceiros.
 * Cabeçalho: logo ao lado do nome + tipo. Quadro central: percorre todas as
 * fotos cadastradas do parceiro, uma de cada vez, avançando a cada `perSlide`.
 * Recebe os parceiros com show_on_tv = true (ordenados, resolvidos no TVDisplay).
 */
export default function Mod05Partners({
  partners, theme, perSlide,
}: {
  partners: Partner[]; theme: TvTheme; perSlide: number;
}) {
  // Sequência plana: cada foto de cada parceiro vira um quadro.
  const frames = useMemo<Frame[]>(() => {
    const out: Frame[] = [];
    partners.forEach((p) => {
      const photos = (p.photos ?? []).filter(Boolean);
      if (photos.length > 0) photos.forEach((image) => out.push({ partner: p, image }));
      else out.push({ partner: p, image: null });
    });
    return out;
  }, [partners]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (frames.length <= 1) return;
    const t = setInterval(() => setIdx((i) => i + 1), Math.max(4, perSlide) * 1000);
    return () => clearInterval(t);
  }, [frames.length, perSlide]);

  if (frames.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <span className="text-7xl">🤝</span>
        <p style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-4xl">
          Quem apoia este evento
        </p>
      </div>
    );
  }

  const frame = frames[idx % frames.length];
  const { partner: p } = frame;
  const centerImage = frame.image || p.logo_url || null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16 py-8 overflow-hidden">
      <span style={{ fontFamily: theme.fontHand, color: theme.inkSoft }} className="text-4xl mb-4">
        Um obrigado especial a quem torna tudo possível ✦
      </span>

      {/* Cabeçalho: logo ao lado do nome + tipo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-5 mb-5"
        >
          {p.logo_url && (
            <div
              className="shrink-0 flex items-center justify-center rounded-2xl shadow-lg"
              style={{ background: theme.frame, width: '12vh', height: '12vh', padding: '10px' }}
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

      {/* Quadro central: foto atual do parceiro */}
      <div className="flex-1 w-full min-h-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${p.id}-${frame.image ?? 'logo'}-${idx}`}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 110, damping: 18 }}
            className="shadow-2xl flex items-center justify-center"
            style={{ background: theme.frame, padding: '24px', borderRadius: 18, maxHeight: '100%' }}
          >
            {centerImage ? (
              <img
                src={centerImage}
                alt={p.name}
                className="object-contain"
                style={{ maxWidth: '52vw', maxHeight: '52vh' }}
              />
            ) : (
              <span style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-7xl text-center px-12 py-16">
                {p.name}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
