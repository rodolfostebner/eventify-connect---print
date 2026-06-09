import { useRef, useState, useEffect } from 'react';
import type { TvTheme } from './theme';

/**
 * Rodapé do telão — marquee horizontal contínuo, sempre visível.
 * Recebe os itens já montados; só cuida do scroll e do visual.
 * Quando `alertText` está presente, vira faixa de aviso (vermelha).
 */
export default function Ticker({
  theme, items, speed, alertText,
}: {
  theme: TvTheme; items: string[]; speed: number; alertText?: string | null;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (trackRef.current) setWidth(trackRef.current.scrollWidth);
  }, [items]);

  // speed (20-120) → px/s. Duração = largura / px-por-segundo.
  const pxPerSec = Math.max(20, speed) * 1.6;
  const duration = width > 0 ? width / pxPerSec : 30;

  if (alertText) {
    return (
      <div
        className="shrink-0 h-[7vh] flex items-center overflow-hidden"
        style={{ background: '#C2342B', borderTop: '4px solid rgba(0,0,0,0.15)' }}
      >
        <div className="ticker-track flex items-center whitespace-nowrap" style={{ animation: `tickerScroll 14s linear infinite` }}>
          {[0, 1].map((k) => (
            <span key={k} style={{ fontFamily: theme.fontBody }} className="text-white text-3xl font-bold px-8 flex items-center gap-3">
              <span className="text-3xl">📣</span> {alertText}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div
      className="shrink-0 h-[7vh] flex items-center overflow-hidden relative"
      style={{ background: theme.ink, borderTop: `4px solid ${theme.accent}` }}
    >
      <style>{`@keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap"
        style={{ animation: `tickerScroll ${duration}s linear infinite`, willChange: 'transform' }}
      >
        {/* duas cópias para loop contínuo */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {items.map((item, i) => (
              <span
                key={`${copy}-${i}`}
                style={{ fontFamily: theme.fontBody, color: theme.paper }}
                className="text-2xl px-7 flex items-center gap-3"
              >
                {item}
                <span style={{ color: theme.accent }}>✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
