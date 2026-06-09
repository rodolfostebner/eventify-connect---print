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
    return subscribeToEvent(slug, (ev) => { if (ev) setEvent(ev); }, console.error);
  }, [slug]);

  useEffect(() => {
    if (!event) return;
    let active = true;
    getTvConfig(event.id).then((c) => {
      if (!active) return;
      setConfig(c);
      setConfigLoaded(true);
    });
    return subscribeToTvConfig(event.id, (c) => active && setConfig(c));
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
