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
import { getActiveSpotlights, upsertTvConfig } from '../../../services/tvService';
import { getTvTheme, ensureThemeFonts, type RotationModuleId } from './theme';
import { useTvRotation } from './useTvRotation';
import AnnouncementOverlay from '../AnnouncementOverlay';
import RaffleOverlay from '../RaffleOverlay';
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

  // Conteúdo (expositores, produtos, parceiros, marketing, prêmios, fotos).
  // Recarrega quando o painel pede atualização (config.updated_at muda) —
  // ex: botão "Atualizar Telão" ou "Ir direto para módulo".
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
    fetchPosts(event.id).then((p) => active && setPhotos(p));
    return () => { active = false; };
  }, [event.id, config.updated_at]);

  // Destaques de expositor — poll periódico + ao pedir atualização do painel
  useEffect(() => {
    let active = true;
    const load = () => getActiveSpotlights(event.id).then((s) => active && setSpotlightIds(s.map((x) => x.exhibitor_id)));
    load();
    const t = setInterval(load, SPOTLIGHT_POLL_MS);
    return () => { active = false; clearInterval(t); };
  }, [event.id, config.updated_at]);

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

  // Nº de itens que cada módulo vai exibir — o motor usa isto para manter o
  // módulo ativo por (tempo por item × nº de itens), exibindo todos em sequência.
  const itemCounts = useMemo<Partial<Record<RotationModuleId, number>>>(() => ({
    mod01: 1, // ranking é uma vista única
    mod02: photos.filter((p) => p.status === 'approved').length,
    mod03: spotlightExhibitors.length,
    mod04: Math.ceil(exhibitors.length / 3), // grupos de 3
    mod05: partners.reduce((s, p) => s + Math.max(1, (p.photos ?? []).filter(Boolean).length), 0),
    mod06: marketingPhotos.length,
  }), [photos, spotlightExhibitors.length, exhibitors.length, partners, marketingPhotos.length]);

  const { activeModule } = useTvRotation(config, implemented, itemCounts);

  // Módulo forçado ("Ir direto para módulo"): mostra enquanto tiver conteúdo e
  // depois volta à rotação automática sozinho. Sem conteúdo, volta na hora.
  useEffect(() => {
    const forced = config.active_module as RotationModuleId | null;
    if (!forced) return;
    if (!implemented.includes(forced)) {
      upsertTvConfig(event.id, { active_module: null }).catch(() => {});
      return;
    }
    const perItem = Number(config[`duration_${forced}` as keyof TvConfig]) || 10;
    const count = Math.max(1, itemCounts[forced] ?? 1);
    const t = setTimeout(() => {
      upsertTvConfig(event.id, { active_module: null }).catch(() => {});
    }, perItem * count * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.active_module, config.updated_at, event.id, implemented]);

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
      {/* Header fixo: logo + nome do evento à esquerda, slug à direita */}
      <Header event={event} theme={theme} />

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

      {/* Sorteio disparado pelo painel (tela cheia) — compartilhado com o telão legado */}
      <RaffleOverlay event={event} />

      {/* Avisos disparados pelo painel (tela cheia + som) — compartilhado com o telão legado */}
      <AnnouncementOverlay event={event} />
    </div>
  );
}

function Header({ event, theme }: { event: EventData; theme: ReturnType<typeof getTvTheme> }) {
  return (
    <header
      className="shrink-0 h-[12vh] flex items-center justify-between px-12"
      style={{ background: theme.frame, borderBottom: `4px solid ${theme.accent}` }}
    >
      {/* Logo + nome do evento */}
      <div className="flex items-center gap-6 min-w-0">
        {event.logo_url && (
          <div
            className="shrink-0 flex items-center justify-center rounded-2xl"
            style={{ background: '#fff', height: '9vh', padding: '8px', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}
          >
            <img src={event.logo_url} alt={event.name} className="max-h-full w-auto object-contain" referrerPolicy="no-referrer" />
          </div>
        )}
        <h1 style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-5xl leading-none truncate">
          {event.name}
        </h1>
      </div>

      {/* Slug do evento */}
      <div className="shrink-0 flex flex-col items-end">
        <span style={{ fontFamily: theme.fontBody, color: theme.inkSoft }} className="text-xl uppercase tracking-widest">
          Participe em
        </span>
        <span style={{ fontFamily: theme.fontDisplay, color: theme.accent }} className="text-4xl leading-none">
          /{event.slug}
        </span>
      </div>
    </header>
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
