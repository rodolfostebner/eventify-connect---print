import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData, PhotoData, Product, Exhibitor, RafflePrize } from '../../../types';
import type { TvConfig } from '../../../services/tvService';
import { fetchPosts, subscribeToPosts } from '../../../services/posts';
import { getExhibitors } from '../../../services/exhibitorService';
import { getProductsByExhibitorIds } from '../../../services/productService';
import { getPrizes } from '../../../services/raffleService';
import { getTvTheme, ensureThemeFonts, type RotationModuleId } from './theme';
import { useTvRotation } from './useTvRotation';
import Ticker from './Ticker';
import Mod01Rank from './modules/Mod01Rank';
import Mod02Carousel from './modules/Mod02Carousel';

// Módulos já implementados nesta fase — só estes entram na rotação automática.
const IMPLEMENTED: readonly RotationModuleId[] = ['mod01', 'mod02'];

export default function TVDisplay({ event, config }: { event: EventData; config: TvConfig }) {
  const theme = getTvTheme(config.theme);

  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [prizes, setPrizes] = useState<RafflePrize[]>([]);

  useEffect(() => { ensureThemeFonts(theme); }, [theme]);

  // Fotos + realtime
  useEffect(() => {
    let active = true;
    fetchPosts(event.id).then((p) => active && setPhotos(p));
    const unsub = subscribeToPosts(event.id, () => {
      fetchPosts(event.id).then((p) => active && setPhotos(p));
    });
    return () => { active = false; unsub(); };
  }, [event.id]);

  // Dados de apoio ao ticker (expositores, produtos, prêmios)
  useEffect(() => {
    let active = true;
    getExhibitors(event.id).then(async (exs) => {
      if (!active) return;
      setExhibitors(exs);
      const prods = await getProductsByExhibitorIds(exs.map((e) => e.id));
      if (active) setProducts(prods);
    });
    getPrizes(event.id).then((p) => active && setPrizes(p));
    return () => { active = false; };
  }, [event.id]);

  const { activeModule } = useTvRotation(config, IMPLEMENTED);

  // ─── Itens do ticker ────────────────────────────────────────────────────────
  const tickerItems = useMemo(() => {
    const items: string[] = [];

    if (config.ticker_show_raffle) {
      const next = prizes.find((p) => !p.winner_ticket_id);
      if (next) items.push(`🎁 Sorteio em breve: ${next.name}`);
    }

    if (config.ticker_show_products) {
      const exMap = new Map(exhibitors.map((e) => [e.id, e]));
      products.forEach((prod) => {
        const hasPhoto = (prod.photos?.length ?? 0) > 0;
        if (!hasPhoto && !config.ticker_show_no_photo) return;
        const ex = exMap.get(prod.exhibitor_id);
        const price = prod.price != null ? ` — R$ ${Number(prod.price).toFixed(2)}` : '';
        const stand = ex ? ` · Estande ${ex.number}` : '';
        items.push(`🛍️ ${prod.name}${price}${stand}`);
      });
    }

    return items;
  }, [config, prizes, products, exhibitors]);

  // ─── Background ─────────────────────────────────────────────────────────────
  const bg: React.CSSProperties = {
    background: `radial-gradient(circle at 30% 20%, ${theme.frame} 0%, ${theme.paper} 55%, ${theme.paper} 100%)`,
  };

  const perSlideMod02 = (Number(config.duration_mod02) || 8);

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col" style={{ ...bg, color: theme.ink }}>
      {/* Palco do módulo ativo */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule ?? 'idle'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {renderModule(activeModule, { photos, theme, eventId: event.id, perSlideMod02 })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rodapé sempre visível */}
      <Ticker theme={theme} items={tickerItems} speed={config.ticker_speed} />
    </div>
  );
}

function renderModule(
  mod: RotationModuleId | null,
  { photos, theme, eventId, perSlideMod02 }: {
    photos: PhotoData[]; theme: ReturnType<typeof getTvTheme>; eventId: string; perSlideMod02: number;
  },
) {
  switch (mod) {
    case 'mod01':
      return <Mod01Rank photos={photos} theme={theme} />;
    case 'mod02':
      return <Mod02Carousel photos={photos} theme={theme} perSlide={perSlideMod02} eventId={eventId} />;
    case null:
      return (
        <div className="w-full h-full flex items-center justify-center">
          <p style={{ fontFamily: theme.fontHand, color: theme.inkSoft }} className="text-5xl">
            Nenhum módulo ativo
          </p>
        </div>
      );
    default:
      // Módulo ainda não implementado (forçado pelo painel) — placeholder.
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <span className="text-6xl">🚧</span>
          <p style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-4xl">
            Módulo em construção
          </p>
          <p style={{ fontFamily: theme.fontBody, color: theme.inkSoft }} className="text-2xl uppercase tracking-wide">
            {mod}
          </p>
        </div>
      );
  }
}
