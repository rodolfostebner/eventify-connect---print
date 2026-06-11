import { supabase } from '../lib/supabase/client';

// Presença via heartbeat (tabela app_sessions): cada navegador no /event/:slug
// grava "estou vivo" a cada HEARTBEAT_MS. Online agora = sessões vistas dentro
// de ONLINE_WINDOW_MS. O histórico fica gravado p/ o relatório pós-feira
// (picos de uso, tempo de permanência, anônimos vs logados).
//
// Telão e painéis NÃO chamam startHeartbeat — só leem — então não inflam a contagem.

const HEARTBEAT_MS = 60_000;        // intervalo entre batidas
const ONLINE_WINDOW_MS = 150_000;   // janela p/ considerar a sessão online (2,5 min)
const SESSION_GAP_MS = 30 * 60_000; // sem batida há 30 min = nova sessão (nova permanência)

export interface OnlineCounts {
  total: number;
  logged: number;     // usuários logados distintos (dedup entre dispositivos)
  anonymous: number;  // sessões anônimas
}

interface StoredSession {
  id: string;
  lastBeat: number;
}

const storageKey = (eventId: string) => `eventify_session_${eventId}`;

// Sessão por navegador+evento (localStorage). Se a última batida for muito
// antiga, gera id novo — senão a permanência somaria dias entre visitas.
function getOrCreateSessionId(eventId: string): string {
  try {
    const raw = localStorage.getItem(storageKey(eventId));
    if (raw) {
      const stored: StoredSession = JSON.parse(raw);
      if (stored.id && Date.now() - stored.lastBeat < SESSION_GAP_MS) return stored.id;
    }
  } catch { /* valor corrompido — gera sessão nova */ }
  const id = crypto.randomUUID();
  rememberBeat(eventId, id);
  return id;
}

function rememberBeat(eventId: string, id: string) {
  try {
    localStorage.setItem(storageKey(eventId), JSON.stringify({ id, lastBeat: Date.now() } satisfies StoredSession));
  } catch { /* storage indisponível — segue sem persistir */ }
}

/**
 * Inicia o heartbeat desta sessão (logada ou anônima) para o evento.
 * Retorna função de cleanup. Se o usuário logar no meio da sessão, a próxima
 * batida atualiza o user_id (a sessão deixa de contar como anônima).
 */
export function startHeartbeat(eventId: string, userId: string | null): () => void {
  if (!supabase || !eventId) return () => {};

  const sessionId = getOrCreateSessionId(eventId);

  const beat = async () => {
    if (!supabase) return;
    const { error } = await supabase
      .from('app_sessions')
      .upsert(
        { id: sessionId, event_id: eventId, user_id: userId, last_seen_at: new Date().toISOString() },
        { onConflict: 'id' }
      );
    if (!error) rememberBeat(eventId, sessionId);
  };

  void beat();
  const timer = setInterval(() => { void beat(); }, HEARTBEAT_MS);
  return () => clearInterval(timer);
}

/** Conta as sessões online agora (vistas na janela de ONLINE_WINDOW_MS). */
export async function getOnlineCounts(eventId: string): Promise<OnlineCounts> {
  if (!supabase) return { total: 0, logged: 0, anonymous: 0 };

  const since = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();
  const { data } = await supabase
    .from('app_sessions')
    .select('user_id')
    .eq('event_id', eventId)
    .gte('last_seen_at', since);

  const rows = data || [];
  // Mesmo usuário em 2 dispositivos conta 1; cada sessão anônima conta 1.
  const logged = new Set(rows.filter((r) => r.user_id).map((r) => r.user_id)).size;
  const anonymous = rows.filter((r) => !r.user_id).length;
  return { total: logged + anonymous, logged, anonymous };
}

/**
 * Polling do contador (quase-realtime, sem websocket): chama cb imediatamente
 * e a cada intervalMs. Retorna função de cleanup.
 */
export function subscribeOnlineCounts(
  eventId: string,
  cb: (counts: OnlineCounts) => void,
  intervalMs = 30_000
): () => void {
  let active = true;
  const load = () => getOnlineCounts(eventId).then((c) => { if (active) cb(c); });
  void load();
  const timer = setInterval(load, intervalMs);
  return () => { active = false; clearInterval(timer); };
}
