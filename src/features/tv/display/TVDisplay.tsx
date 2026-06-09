import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData, PhotoData, Product, Exhibitor, Partner, RafflePrize } from '../../../types';
import type { TvConfig } from '../../../services/tvService';
import { fetchPosts, subscribeToPosts } from '../../../services/posts';
import { getExhibitors } from '../../../services/exhibitorService';
import { getProductsByExhibitorIds } from '../../../services/productService';
import { getPrizes } from '../../../services/raffleService';
import { getPartners } from '../../../services/partnerService';
import { getMarketingPhotos, type MarketingPhoto } from '../../../services/marketingService';
import { getActiveSpotlights } from '../../../services/tvService';
import { getTvTheme, ensureThemeFonts, type RotationModuleId } from './theme';
import { useTvRotation } from './useTvRotation';
import Ticker, { type TickerItem } from './Ticker';
import Mod01Rank from './modules/Mod01Rank';
import Mod02Carousel from './modules/Mod02Carousel';
import Mod03Spotlight from './modules/Mod03Spotlight';
import Mod04Trio from './modules/Mod04Trio';
import Mod05Partners from './modules/Mod05Partners';
import Mod06Marketing from './modules/Mod06Marketing';

// Recarrega os destaques de expositor periodicamente (admin controla em tempo real)
const SPOTLIGHT_POLL_MS = 12000;

export default function TVDisplay({ event, config }: { event: EventData; config: TvConfig }) {
  const theme = getTvTheme(config.theme);

  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [marketingPhotos, setMarketingPhotos] = useState<MarketingPhoto[]>([]);
  const [spotlightIds, setSpotlightIds] = useState<string[]>([]);
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

  // Expositores + produtos (apoio ao ticker e aos módulos 03/04)
  useEffect(() => {
    let active = true;
    getExhibitors(event.id).then(async (exs) => {
      if (!active) return;
      setExhibitors(exs);
      const prods = await getProductsByExhibitorIds(exs.map((e) => e.id));
      if (active) setProducts(prods);
    });
    getPartners(event.id).then((ps) => active && setPartners(ps.filter((p) => p.show_on_tv)));
    getMarketingPhotos(event.id).then((ms) => active && setMarketingPhotos(ms.filter((m) => m.active)));
    getPrizes(event.id).then((p) => active && setPrizes(p));
    return () => { active = false; };
  }, [event.id]);

  // Destaques de expositor — poll periódico (controlado pelo painel em tempo real)
  useEffect(() => {
    let active = true;
    const load = () => getActiveSpotlights(event.id).then((s) => active && setSpotlightIds(s.map((x) => x.exhibitor_id)));
    load();
    const t = setInterval(load, SPOTLIGHT_POLL_MS);
    return () => { active = false; clearInterval(t); };
  }, [event.id]);

  // Expositores em destaque agora (resolvidos a partir da lista completa)
  const spotlightExhibitors = useMemo(
    () => exhibitors.filter((e) => spotlightIds.includes(e.id)),
    [exhibitors, spotlightIds],
  );

  // Só entram na rotação os módulos com conteúdo (além do controle de pausa do painel).
  const implemented = useMemo<RotationModuleId[]>(() => {
    const list: RotationModuleId[] = ['mod01', 'mod02'];
    if (spotlightExhibitors.length > 0) list.push('mod03');
    if (exhibitors.length > 0) list.push('mod04');
    if (partners.length > 0) list.push('mod05');
    if (marketingPhotos.length > 0) list.push('mod06');
    return list;
  }, [spotlightExhibitors.length, exhibitors.length, partners.length, marketingPhotos.length]);

  const { activeModule } = useTvRotation(config, implemented);

  // ─── Itens do ticker ────────────────────────────────────────────────────────
  const tickerItems = useMemo<TickerItem[]>(() => {
    const items: TickerItem[] = [];

    if (config.ticker_show_raffle) {
      const next = prizes.find((p) => !p.winner_ticket_id);
      if (next) items.push({ text: `🎁 Sorteio em breve: ${next.name}` });
    }

    if (config.ticker_show_products) {
      const exMap = new Map(exhibitors.map((e) => [e.id, e]));
      products.forEach((prod) => {
        const photo = prod.photos?.[0] ?? null;
        if (!photo && !config.ticker_show_no_photo) return;
        const ex = exMap.get(prod.exhibitor_id);
        const price = prod.price != null ? ` — R$ ${Number(prod.price).toFixed(2)}` : '';
        const who = ex ? ` · ${ex.name}` : '';
        // Com foto, a miniatura já indica o produto; sem foto, mantém o emoji.
        const text = photo ? `${prod.name}${price}${who}` : `🛍️ ${prod.name}${price}${who}`;
        items.push({ text, image: photo });
      });
    }

    return items;
  }, [config, prizes, products, exhibitors]);

  // ─── Background ─────────────────────────────────────────────────────────────
  const bg: React.CSSProperties = {
    background: `radial-gradient(circle at 30% 20%, ${theme.frame} 0%, ${theme.paper} 55%, ${theme.paper} 100%)`,
  };

  const dur = (mod: RotationModuleId, fallback: number) => Number(config[`duration_${mod}` as keyof TvConfig]) || fallback;

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
            {renderModule(activeModule, {
              photos, exhibitors, spotlightExhibitors, partners, marketingPhotos,
              theme, eventId: event.id, dur,
            })}
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
  ctx: {
    photos: PhotoData[];
    exhibitors: Exhibitor[];
    spotlightExhibitors: Exhibitor[];
    partners: Partner[];
    marketingPhotos: MarketingPhoto[];
    theme: ReturnType<typeof getTvTheme>;
    eventId: string;
    dur: (mod: RotationModuleId, fallback: number) => number;
  },
) {
  const { photos, exhibitors, spotlightExhibitors, partners, marketingPhotos, theme, eventId, dur } = ctx;
  switch (mod) {
    case 'mod01':
      return <Mod01Rank photos={photos} theme={theme} />;
    case 'mod02':
      return <Mod02Carousel photos={photos} theme={theme} perSlide={dur('mod02', 8)} eventId={eventId} />;
    case 'mod03':
      return <Mod03Spotlight exhibitors={spotlightExhibitors} theme={theme} perSlide={dur('mod03', 12)} />;
    case 'mod04':
      return <Mod04Trio exhibitors={exhibitors} theme={theme} perSlide={dur('mod04', 12)} />;
    case 'mod05':
      return <Mod05Partners partners={partners} theme={theme} perSlide={dur('mod05', 10)} />;
    case 'mod06':
      return <Mod06Marketing photos={marketingPhotos} theme={theme} perSlide={dur('mod06', 10)} />;
    case null:
      return (
        <div className="w-full h-full flex items-center justify-center">
          <p style={{ fontFamily: theme.fontHand, color: theme.inkSoft }} className="text-5xl">
            Nenhum módulo ativo
          </p>
        </div>
      );
    default:
      return null;
  }
}
