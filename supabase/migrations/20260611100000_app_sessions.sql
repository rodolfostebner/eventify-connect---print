-- Sessões do app via heartbeat — contador de pessoas online (telão/painel)
-- e base do relatório pós-feira (picos de uso, permanência, anônimos vs logados).
--
-- Cada navegador no /event/:slug grava "estou vivo" a cada ~60s (presenceService).
-- Online agora = sessões com last_seen_at dentro da janela (~2,5 min).
-- Permanência = last_seen_at - started_at. user_id null = visitante anônimo.

CREATE TABLE app_sessions (
  id            uuid        PRIMARY KEY,  -- gerado no cliente (localStorage, 1 por navegador/evento)
  event_id      uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id       text        REFERENCES users(id) ON DELETE SET NULL,  -- null = anônimo (users.id é text)
  started_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_sessions_event_seen ON app_sessions(event_id, last_seen_at DESC);
CREATE INDEX idx_app_sessions_user       ON app_sessions(user_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE app_sessions ENABLE ROW LEVEL SECURITY;

-- Leitura pública (telão e painel usam anon key)
CREATE POLICY "app_sessions_select_public" ON app_sessions
  FOR SELECT TO anon, authenticated USING (true);

-- Escrita: anon + authenticated (visitantes anônimos e BETA_MODE usam anon key)
CREATE POLICY "app_sessions_write_public" ON app_sessions
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON app_sessions TO anon, authenticated;

-- ─── tv_config: exibição do contador no telão ───────────────────────────────

-- true = header do telão mostra o total de pessoas no app (painel controla)
ALTER TABLE tv_config ADD COLUMN show_online_count boolean NOT NULL DEFAULT true;
