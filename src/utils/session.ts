// ID de sessão anônima para analytics de visitas.
// - Gerado uma única vez por aba do browser e persistido em sessionStorage.
// - Cacheado em memória após a primeira leitura para evitar I/O em cliques subsequentes.
// - Em modo privado/SSR (sessionStorage indisponível), cai para ID em memória.

const KEY = 'eventify_session_id';
let cached: string | null = null;

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId(): string {
  if (cached) return cached;
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) {
      cached = stored;
      return cached;
    }
    const fresh = generateId();
    sessionStorage.setItem(KEY, fresh);
    cached = fresh;
    return fresh;
  } catch {
    cached = generateId();
    return cached;
  }
}
