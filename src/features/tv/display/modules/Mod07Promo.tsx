import { motion } from 'motion/react';
import type { Exhibitor, Product } from '../../../../types';
import { tvImageFor, type TvTheme } from '../theme';

/**
 * MOD-07 · Promover Stand — destaca um único stand escolhido no painel
 * (tv_config.mod07_exhibitor_id), pensado para dar visibilidade a stands com
 * pouco movimento. Texto e frase de chamada vêm do painel (podem sobrescrever
 * o cadastro do expositor). Exibe N vezes e sai da rotação (controlado no
 * TVDisplay via mod07_shows_done/mod07_max_shows).
 *
 * Layout: foto principal à esquerda (moldura destacada), logo + nome acima;
 * texto à direita com até 5 fotos de produtos abaixo.
 */
export default function Mod07Promo({
  exhibitor, text, tagline, products, theme,
}: {
  exhibitor: Exhibitor;
  text: string | null;
  tagline: string | null;
  products: Product[];
  theme: TvTheme;
}) {
  const photo = tvImageFor(exhibitor);
  const body = text || exhibitor.description || '';
  const call = tagline || exhibitor.tagline || '';
  const productPhotos = products
    .filter((p) => p.exhibitor_id === exhibitor.id && p.photos?.[0])
    .slice(0, 5);

  return (
    <div className="w-full h-full flex items-center justify-center px-16 py-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 110, damping: 18 }}
        className="w-full h-full grid grid-cols-12 gap-12 items-center"
      >
        {/* Coluna esquerda: logo + nome acima da foto */}
        <div className="col-span-5 flex flex-col items-center justify-center gap-5 min-h-0">
          <div className="flex items-center gap-4 max-w-full">
            {exhibitor.logo_url && (
              <div
                className="shrink-0 flex items-center justify-center rounded-2xl shadow-lg"
                style={{ background: '#fff', height: '10vh', width: '10vh', padding: 8 }}
              >
                <img src={exhibitor.logo_url} alt="" className="max-h-full max-w-full object-contain" />
              </div>
            )}
            <h1 style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-5xl leading-tight">
              {exhibitor.name}
            </h1>
          </div>

          {/* Foto principal com moldura destacada (borda dupla na cor de acento) */}
          <div
            className="shadow-2xl"
            style={{
              background: theme.frame,
              padding: '18px 18px 0',
              borderRadius: 10,
              border: `5px solid ${theme.accent}`,
              boxShadow: `0 0 0 4px ${theme.frame}, 0 18px 44px rgba(0,0,0,0.3)`,
              transform: 'rotate(-1.5deg)',
            }}
          >
            <div className="relative flex items-center justify-center overflow-hidden" style={{ background: theme.paper }}>
              {photo ? (
                <img
                  src={photo}
                  alt={exhibitor.name}
                  className="block object-contain"
                  style={{ height: 'auto', width: 'auto', maxHeight: '46vh', maxWidth: '34vw' }}
                />
              ) : (
                <div className="flex items-center justify-center" style={{ height: '46vh', width: '34vw' }}>
                  <span style={{ fontFamily: theme.fontDisplay, color: theme.inkSoft }} className="text-8xl">
                    {exhibitor.name?.[0] ?? '★'}
                  </span>
                </div>
              )}
            </div>
            <div className="px-2 py-3 flex items-center justify-center gap-3">
              <span className="text-3xl">📣</span>
              <span style={{ fontFamily: theme.fontHand, color: theme.accent }} className="text-4xl leading-none">
                Venha conhecer este estande
              </span>
            </div>
          </div>
        </div>

        {/* Coluna direita: chamada + texto + produtos */}
        <div className="col-span-7 flex flex-col gap-6 pr-6 min-h-0">
          <span style={{ fontFamily: theme.fontBody, color: theme.inkSoft }} className="text-2xl uppercase tracking-widest">
            {exhibitor.category}
          </span>

          {call && (
            <p style={{ fontFamily: theme.fontHand, color: theme.accent2 }} className="text-6xl leading-tight">
              {call}
            </p>
          )}

          {body && (
            <p style={{ fontFamily: theme.fontBody, color: theme.ink }} className="text-3xl leading-snug line-clamp-5 whitespace-pre-line">
              {body}
            </p>
          )}

          {/* Até 5 fotos de produtos */}
          {productPhotos.length > 0 && (
            <div className="flex gap-5 mt-2">
              {productPhotos.map((p, i) => (
                <div
                  key={p.id}
                  className="shadow-xl"
                  style={{
                    background: theme.frame,
                    padding: '8px 8px 0',
                    borderRadius: 6,
                    transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
                  }}
                >
                  <div className="overflow-hidden" style={{ width: '11vw', height: '11vw', background: theme.paper }}>
                    <img src={p.photos![0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <p
                    style={{ fontFamily: theme.fontBody, color: theme.ink }}
                    className="text-base text-center py-1.5 truncate"
                  >
                    {p.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
