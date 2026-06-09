-- Tabelas de suporte ao painel de controle do telão

-- ─── Configuração da fila de módulos do telão ───────────────────────────────

CREATE TABLE tv_config (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id              uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Rotação geral
  rotation_paused       boolean     NOT NULL DEFAULT false,
  active_module         text,       -- módulo forçado agora (null = rotação normal)
  theme                 text        NOT NULL DEFAULT 'default',

  -- Duração por módulo (segundos)
  duration_mod01        int         NOT NULL DEFAULT 15,
  duration_mod02        int         NOT NULL DEFAULT 8,
  duration_mod03        int         NOT NULL DEFAULT 12,
  duration_mod04        int         NOT NULL DEFAULT 12,
  duration_mod05        int         NOT NULL DEFAULT 10,
  duration_mod06        int         NOT NULL DEFAULT 10,

  -- Módulos pausados
  paused_mod01          boolean     NOT NULL DEFAULT false,
  paused_mod02          boolean     NOT NULL DEFAULT false,
  paused_mod03          boolean     NOT NULL DEFAULT false,
  paused_mod04          boolean     NOT NULL DEFAULT false,
  paused_mod05          boolean     NOT NULL DEFAULT false,
  paused_mod06          boolean     NOT NULL DEFAULT false,

  -- Ticker
  ticker_show_raffle    boolean     NOT NULL DEFAULT true,
  ticker_show_alerts    boolean     NOT NULL DEFAULT true,
  ticker_show_products  boolean     NOT NULL DEFAULT true,
  ticker_show_no_photo  boolean     NOT NULL DEFAULT false,
  ticker_speed          int         NOT NULL DEFAULT 50,

  updated_at            timestamptz DEFAULT now(),

  UNIQUE(event_id)
);

-- ─── Histórico de expositores em destaque (MOD-03) ──────────────────────────

CREATE TABLE tv_exhibitor_spotlight (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id      uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  exhibitor_id  uuid        NOT NULL REFERENCES exhibitors(id) ON DELETE CASCADE,
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz           -- null = em destaque agora
);

CREATE INDEX idx_tv_spotlight_event    ON tv_exhibitor_spotlight(event_id);
CREATE INDEX idx_tv_spotlight_active   ON tv_exhibitor_spotlight(event_id) WHERE ended_at IS NULL;

-- ─── Histórico de fotos exibidas no telão (MOD-01/02) ───────────────────────

CREATE TABLE tv_photo_history (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  post_id    uuid        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  module     text        NOT NULL CHECK (module IN ('mod01', 'mod02')),
  shown_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tv_photo_history_event ON tv_photo_history(event_id);
CREATE INDEX idx_tv_photo_history_post  ON tv_photo_history(post_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE tv_config             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_exhibitor_spotlight ENABLE ROW LEVEL SECURITY;
ALTER TABLE tv_photo_history       ENABLE ROW LEVEL SECURITY;

-- Leitura pública (o telão usa anon key)
CREATE POLICY "tv_config_select_public"    ON tv_config
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "tv_spotlight_select_public" ON tv_exhibitor_spotlight
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "tv_photo_history_select_public" ON tv_photo_history
  FOR SELECT TO anon, authenticated USING (true);

-- Escrita: anon + authenticated (BETA_MODE usa anon key, sem sessão Supabase Auth)
CREATE POLICY "tv_config_write_auth" ON tv_config
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "tv_spotlight_write_auth" ON tv_exhibitor_spotlight
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "tv_photo_history_write_auth" ON tv_photo_history
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON tv_config              TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tv_exhibitor_spotlight TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tv_photo_history       TO anon, authenticated;
