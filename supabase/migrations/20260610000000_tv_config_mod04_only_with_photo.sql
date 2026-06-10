-- MOD-04 (Trio de Expositores): filtro opcional para exibir apenas expositores
-- que possuem foto (photo_url ou logo_url). false = mostra todos.

ALTER TABLE tv_config
  ADD COLUMN IF NOT EXISTS mod04_only_with_photo boolean NOT NULL DEFAULT false;
