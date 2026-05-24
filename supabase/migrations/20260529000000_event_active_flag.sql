-- Adiciona flag de inativação de eventos (substitui delete permanente)
-- Eventos com active = false ficam ocultos para participantes mas visíveis no painel admin

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
