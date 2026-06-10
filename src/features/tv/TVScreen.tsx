import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { EventData } from '../../types';
import { subscribeToEvent } from '../../services/eventService';
import { getTvConfig, subscribeToTvConfig, type TvConfig } from '../../services/tvService';
import LegacyTVView from './TVView';
import TVDisplay from './display/TVDisplay';

/**
 * Roteador visual do telão: escolhe o tema a partir de `tv_config.theme`.
 * - `default` (ou sem config) → TVView legado (ranking por categoria).
 * - demais temas (ex: `pop-yearbook`) → novo motor de rotação modular.
 */
export default function TVScreen() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [config, setConfig] = useState<TvConfig | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // 1. Realtime
    const unsub = subscribeToEvent(slug, (ev) => { if (ev) setEvent(ev); }, console.error);

    // 2. Polling de fallback — garante que disparos de aviso (active_announcement_id)
    //    cheguem ao telão mesmo quando o realtime do Supabase não está disponível.
    const poll = setInterval(() => {
      import('../../services/eventService').then(({ getEventBySlug }) => {
        getEventBySlug(slug).then((ev) => {
          if (!ev) return;
          setEvent((cur) =>
            cur?.active_announcement_id !== ev.active_announcement_id ||
            cur?.announcement_trigger_at !== ev.announcement_trigger_at ||
            cur?.tv_raffle_state !== ev.tv_raffle_state ||
            cur?.tv_raffle_prize_id !== ev.tv_raffle_prize_id
              ? ev
              : cur,
          );
        }).catch(console.error);
      });
    }, 5000);

    return () => { unsub(); clearInterval(poll); };
  }, [slug]);

  useEffect(() => {
    if (!event) return;
    let active = true;
    // Atualiza só quando muda de fato (evita re-render desnecessário)
    const apply = (c: TvConfig | null) => setConfig((prev) =>
      prev && c && prev.updated_at === c.updated_at ? prev : c,
    );
    const load = () => getTvConfig(event.id).then((c) => {
      if (!active) return;
      apply(c);
      setConfigLoaded(true);
    });
    load();
    const unsub = subscribeToTvConfig(event.id, (c) => active && apply(c));
    // Polling de fallback: garante que mudanças no painel cheguem ao telão
    // mesmo quando o realtime do Supabase não está disponível.
    const poll = setInterval(load, 4000);
    return () => { active = false; unsub(); clearInterval(poll); };
  }, [event?.id]);

  const theme = config?.theme ?? 'default';

  // Tema novo: exige event + config carregados
  if (theme !== 'default') {
    if (!event || !config) return <Loader />;
    return <TVDisplay event={event} config={config} />;
  }

  // Tema default: aguarda só a resolução da config para evitar flicker
  if (event && !configLoaded) return <Loader />;
  return <LegacyTVView />;
}

function Loader() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}
