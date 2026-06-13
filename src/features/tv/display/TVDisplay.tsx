import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData, PhotoData, Product, Exhibitor, Partner, RafflePrize } from '../../../types';
import type { TvConfig } from '../../../services/tvService';
import { fetchPosts, subscribeToPosts } from '../../../services/posts';
import { getExhibitors } from '../../../services/exhibitorService';
import { getProductsByExhibitorIds } from '../../../services/productService';
import { getPrizes } from '../../../services/raffleService';
import { getPartners } from '../../../services/partnerService';
import { getMarketingPhotos, getMarketingContact, type MarketingPhoto, type MarketingContact } from '../../../services/marketingService';
import { getActiveSpotlights, upsertTvConfig } from '../../../services/tvService';
import { subscribeOnlineCounts } from '../../../services/presenceService';
import { getTvTheme, ensureThemeFonts, type RotationModuleId } from './theme';
import { useTvRotation } from './useTvRotation';
import AnnouncementOverlay from '../AnnouncementOverlay';
import RaffleOverlay from '../RaffleOverlay';
import Ticker, { type TickerItem } from './Ticker';
import Mod01Rank from './modules/Mod01Rank';
import Mod02Carousel from './modules/Mod02Carousel';
import Mod03Spotlight from './modules/Mod03Spotlight';
import Mod04Trio from './modules/Mod04Trio';
import Mod05Partners, { usePartnerSlides, type PartnerSlide } from './modules/Mod05Partners';
import Mod06Marketing, { useMarketingSlides, type Slide as MarketingSlide } from './modules/Mod06Marketing';
import Mod07Promo from './modules/Mod07Promo';

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
  const [onlineTotal, setOnlineTotal] = useState<number | null>(null);
  const [tickerRound, setTickerRound] = useState(0);
  const [marketingContact, setMarketingContact] = useState<MarketingContact | null>(null);

  useEffect(() => { ensureThemeFonts(theme); }, [theme]);

  // Tamanho do texto (painel de controle): escala o font-size raiz da página.
  // Todos os textos dos módulos usam classes rem, então acompanham a escala;
  // os quadros de foto (vh/vw) ficam fixos. Restaura o padrão ao desmontar.
  useEffect(() => {
    const scale = config.text_scale ?? 100;
    document.documentElement.style.fontSize = scale === 100 ? '' : `${scale}%`;
    return () => { document.documentElement.style.fontSize = ''; };
  }, [config.text_scale]);

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
    getMarketingContact(event.id).then((mc) => active && setMarketingContact(mc));
    getPrizes(event.id).then((p) => active && setPrizes(p));
    fetchPosts(event.id).then((p) => active && setPhotos(p));
    return () => { active = false; };
  }, [event.id, config.updated_at]);

  // Pessoas no app agora (heartbeat de presença) — exibido no header se o
  // painel habilitar (show_online_count); null oculta o badge.
  useEffect(() => {
    if (!config.show_online_count) {
      setOnlineTotal(null);
      return;
    }
    return subscribeOnlineCounts(event.id, (c) => setOnlineTotal(c.total), 30_000);
  }, [event.id, config.show_online_count]);

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

  // Expositores do MOD-04 — opcionalmente só os que têm foto (photo_url/logo_url)
  const trioExhibitors = useMemo(
    () => (config.mod04_only_with_photo
      ? exhibitors.filter((e) => e.photo_url || e.logo_url)
      : exhibitors),
    [exhibitors, config.mod04_only_with_photo],
  );

  // MOD-07: stand promovido pelo painel — só roda enquanto não atingir o
  // limite de exibições (mod07_shows_done < mod07_max_shows).
  const promoExhibitor = useMemo(
    () => exhibitors.find((e) => e.id === config.mod07_exhibitor_id) ?? null,
    [exhibitors, config.mod07_exhibitor_id],
  );
  const promoActive = Boolean(
    promoExhibitor && (config.mod07_shows_done ?? 0) < (config.mod07_max_shows ?? 0),
  );

  // Telas do MOD-05 (pareamento de fotos por proporção) — compartilhado com o
  // módulo para que o tempo na rotação seja por tela exibida, não por foto.
  const partnerSlides = usePartnerSlides(partners);

  // Telas do MOD-06 (boas-vindas, pareamento de retratos e filtragem)
  const marketingSlides = useMarketingSlides(marketingPhotos);

  // Só entram na rotação os módulos com conteúdo (além do controle de pausa do painel).
  const implemented = useMemo<RotationModuleId[]>(() => {
    const list: RotationModuleId[] = ['mod01', 'mod02'];
    if (spotlightExhibitors.length > 0) list.push('mod03');
    if (trioExhibitors.length > 0) list.push('mod04');
    if (partners.length > 0) list.push('mod05');
    if (promoActive) list.push('mod07');
    // MOD-06 entra sempre: a 1ª página é a tela de boas-vindas do evento.
    list.push('mod06');
    return list;
  }, [spotlightExhibitors.length, trioExhibitors.length, partners.length, promoActive]);

  // Nº de itens que cada módulo vai exibir — o motor usa isto para manter o
  // módulo ativo por (tempo por item × nº de itens), exibindo todos em sequência.
  const itemCounts = useMemo<Partial<Record<RotationModuleId, number>>>(() => ({
    mod01: 1, // ranking é uma vista única
    mod02: Math.ceil(photos.filter((p) => p.status === 'approved').length / 3), // trios

    mod03: spotlightExhibitors.length,
    mod04: Math.ceil(trioExhibitors.length / 3), // grupos de 3
    mod05: partnerSlides.length, // telas reais (pareamento de fotos já resolvido)
    mod06: marketingSlides.length, // telas reais (pareamento de retratos já resolvido)
    mod07: 1, // um stand promovido por vez
  }), [photos, spotlightExhibitors.length, trioExhibitors.length, partnerSlides.length, marketingSlides.length]);

  const { activeModule } = useTvRotation(config, implemented, itemCounts);

  // MOD-07: conta a exibição quando o módulo TERMINA (sai do palco). Contar no
  // fim evita cortar a última exibição — se contasse no início, atingir o
  // limite removeria o módulo da fila com ele ainda na tela.
  const prevModuleRef = useRef<RotationModuleId | null>(null);
  const configRef = useRef(config);
  configRef.current = config;
  useEffect(() => {
    const prev = prevModuleRef.current;
    prevModuleRef.current = activeModule;
    if (prev === 'mod07' && activeModule !== 'mod07') {
      const c = configRef.current;
      upsertTvConfig(event.id, { mod07_shows_done: (c.mod07_shows_done ?? 0) + 1 }).catch(() => {});
    }
  }, [activeModule, event.id]);

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

      // Filtra os produtos exibíveis e agrupa por stand
      const byStand = new Map<string, Product[]>();
      products.forEach((prod) => {
        const photo = prod.photos?.[0] ?? null;
        if (!photo && !config.ticker_show_no_photo) return;
        const arr = byStand.get(prod.exhibitor_id) ?? [];
        arr.push(prod);
        byStand.set(prod.exhibitor_id, arr);
      });

      // Para cada stand, seleciona uma fatia de no máximo 3 produtos para o tickerRound atual.
      const numToShow = 3;
      byStand.forEach((exProducts) => {
        const total = exProducts.length;
        if (total === 0) return;

        let slice: Product[] = [];
        if (total <= numToShow) {
          slice = exProducts;
        } else {
          const startIdx = (tickerRound * numToShow) % total;
          for (let n = 0; n < numToShow; n++) {
            const idx = (startIdx + n) % total;
            slice.push(exProducts[idx]);
          }
        }

        slice.forEach((prod) => {
          const photo = prod.photos?.[0] ?? null;
          const ex = exMap.get(prod.exhibitor_id);
          const price = prod.price != null ? ` — R$ ${Number(prod.price).toFixed(2)}` : '';
          const who = ex ? ` · ${ex.name}` : '';
          // Com foto, a miniatura já indica o produto; sem foto, mantém o emoji.
          const text = photo ? `${prod.name}${price}${who}` : `🛍️ ${prod.name}${price}${who}`;
          items.push({ text, image: photo });
        });
      });
    }

    return items;
  }, [config, prizes, products, exhibitors, tickerRound]);

  // ─── Background ─────────────────────────────────────────────────────────────
  const bg: React.CSSProperties = {
    background: `radial-gradient(circle at 30% 20%, ${theme.frame} 0%, ${theme.paper} 55%, ${theme.paper} 100%)`,
  };

  const dur = (mod: RotationModuleId, fallback: number) => Number(config[`duration_${mod}` as keyof TvConfig]) || fallback;

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col" style={{ ...bg, color: theme.ink }}>
      {/* Header fixo: logo + nome do evento à esquerda, contador + slug à direita */}
      <Header event={event} theme={theme} onlineTotal={onlineTotal} />

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
              photos, exhibitors: trioExhibitors, spotlightExhibitors, partnerSlides, marketingSlides,
              marketingContact, promoExhibitor, products, config,
              theme, eventId: event.id, event, dur,
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rodapé sempre visível */}
      <Ticker theme={theme} items={tickerItems} speed={config.ticker_speed} scale={(config.ticker_scale ?? 100) / 100} onLoop={() => setTickerRound((r) => r + 1)} />

      {/* Sorteio disparado pelo painel (tela cheia) — compartilhado com o telão legado */}
      <RaffleOverlay event={event} />

      {/* Avisos disparados pelo painel (tela cheia + som) — compartilhado com o telão legado */}
      <AnnouncementOverlay event={event} />
    </div>
  );
}

function Header({ event, theme, onlineTotal }: {
  event: EventData;
  theme: ReturnType<typeof getTvTheme>;
  onlineTotal: number | null;
}) {
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

      {/* Pessoas no app agora (habilitado no painel de controle) */}
      {onlineTotal !== null && (
        <div
          className="shrink-0 flex items-center gap-3 rounded-2xl px-6 py-3 mx-6"
          style={{ background: theme.paper, border: `3px solid ${theme.accent}` }}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: theme.accent }} />
            <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: theme.accent }} />
          </span>
          <span style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-4xl leading-none">
            {onlineTotal}
          </span>
          <span style={{ fontFamily: theme.fontBody, color: theme.inkSoft }} className="text-lg uppercase tracking-widest leading-tight">
            no app<br />agora
          </span>
        </div>
      )}

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
    partnerSlides: PartnerSlide[];
    marketingSlides: MarketingSlide[];
    marketingContact: MarketingContact | null;
    promoExhibitor: Exhibitor | null;
    products: Product[];
    config: TvConfig;
    theme: ReturnType<typeof getTvTheme>;
    eventId: string;
    event: EventData;
    dur: (mod: RotationModuleId, fallback: number) => number;
  },
) {
  const { photos, exhibitors, spotlightExhibitors, partnerSlides, marketingSlides, marketingContact, promoExhibitor, products, config, theme, eventId, event, dur } = ctx;
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
      return <Mod05Partners slides={partnerSlides} theme={theme} perSlide={dur('mod05', 10)} />;
    case 'mod06':
      return <Mod06Marketing slides={marketingSlides} theme={theme} perSlide={dur('mod06', 10)} event={event} contact={marketingContact} />;
    case 'mod07':
      return promoExhibitor ? (
        <Mod07Promo
          exhibitor={promoExhibitor}
          text={config.mod07_text}
          tagline={config.mod07_tagline}
          products={products}
          theme={theme}
        />
      ) : null;
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
