-- MOD-07 (Promover Stand): destaca um stand com pouca visibilidade em módulo
-- próprio na rotação do telão, com texto/frase customizáveis e número limitado
-- de exibições. Ao atingir mod07_max_shows o módulo sai da rotação (inativo)
-- até outro stand ser escolhido no painel.

ALTER TABLE tv_config
  ADD COLUMN IF NOT EXISTS duration_mod07     integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS paused_mod07       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mod07_exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mod07_text         text,
  ADD COLUMN IF NOT EXISTS mod07_tagline      text,
  ADD COLUMN IF NOT EXISTS mod07_max_shows    integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS mod07_shows_done   integer NOT NULL DEFAULT 0;
