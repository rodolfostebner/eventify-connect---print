-- =====================================================================
-- Migração: Métricas do Dashboard do EventAdmin
-- Data: 2026-05-26
--
-- - events.exhibitors_estimation: quantidade de expositores previstos.
-- - visits.event_status: fase do evento no momento da visita (pre/live/post),
--   preenchida pelo trackVisit. Nullable para visitas antigas/sem fase.
-- =====================================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS exhibitors_estimation integer NOT NULL DEFAULT 0;

ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS event_status text
    CHECK (event_status IN ('pre', 'live', 'post'));

CREATE INDEX IF NOT EXISTS visits_event_status_idx ON visits(event_status);
