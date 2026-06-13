import { useRef, useState, useEffect } from 'react';
import type { TvTheme } from './theme';

export interface TickerItem {
  text: string;
  image?: string | null;
}

/**
 * Rodapé do telão — marquee horizontal contínuo, sempre visível.
 * Recebe os itens já montados; só cuida do scroll e do visual.
 * Cada item pode ter uma miniatura (ex: foto do produto).
 * Quando `alertText` está presente, vira faixa de aviso (vermelha).
 *
 * `scale` (1-2, vindo do painel) amplia altura, texto, miniaturas, padding e
 * gaps proporcionalmente — tudo na barra cresce junto. Tamanhos base em vh/rem
 * multiplicados por scale; o resto do telão (flex-1) cede a altura extra.
 */
export default function Ticker({
  theme, items, speed, alertText, scale = 1, onLoop,
}: {
  theme: TvTheme; items: TickerItem[]; speed: number; alertText?: string | null; scale?: number; onLoop?: () => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  // Recalcula a largura quando os itens OU a escala mudam (escala altera o tamanho).
  useEffect(() => {
    if (trackRef.current) setWidth(trackRef.current.scrollWidth);
  }, [items, scale]);

  // speed (20-120) → px/s. Duração = largura / px-por-segundo.
  const pxPerSec = Math.max(20, speed) * 1.6;
  const duration = width > 0 ? width / pxPerSec : 30;

  // Tamanhos base × escala (clampada em 1-2 = padrão a dobro).
  const s = Math.min(2, Math.max(1, scale));
  const height = `${7 * s}vh`;
  const thumb = `${5 * s}vh`;

  if (alertText) {
    return (
      <div
        className="shrink-0 flex items-center overflow-hidden"
        style={{ height, background: '#C2342B', borderTop: '4px solid rgba(0,0,0,0.15)' }}
      >
        <div className="ticker-track flex items-center whitespace-nowrap" style={{ animation: `tickerScroll 14s linear infinite` }}>
          {[0, 1].map((k) => (
            <span
              key={k}
              style={{ fontFamily: theme.fontBody, fontSize: `${1.875 * s}rem`, paddingInline: `${2 * s}rem`, gap: `${0.75 * s}rem` }}
              className="text-white font-bold flex items-center"
            >
              <span>📣</span> {alertText}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div
      className="shrink-0 flex items-center overflow-hidden relative"
      style={{ height, background: theme.ink, borderTop: `4px solid ${theme.accent}` }}
    >
      <style>{`@keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap"
        style={{ animation: `tickerScroll ${duration}s linear infinite`, willChange: 'transform' }}
        onAnimationIteration={onLoop}
      >
        {/* duas cópias para loop contínuo */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {items.map((item, i) => (
              <span
                key={`${copy}-${i}`}
                style={{ fontFamily: theme.fontBody, color: theme.paper, fontSize: `${1.5 * s}rem`, paddingInline: `${1.75 * s}rem`, gap: `${0.75 * s}rem` }}
                className="flex items-center"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="object-cover rounded-lg shrink-0"
                    style={{ height: thumb, width: thumb, border: `2px solid ${theme.frame}` }}
                  />
                )}
                {item.text}
                <span style={{ color: theme.accent }}>✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
