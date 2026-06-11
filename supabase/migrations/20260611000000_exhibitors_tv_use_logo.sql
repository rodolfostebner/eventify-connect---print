-- Expositor: escolha da imagem exibida nos módulos de expositor do telão
-- (MOD-03/04/07). false (padrão) = foto do stand com fallback para a logo;
-- true = logo com fallback para a foto.

ALTER TABLE exhibitors
  ADD COLUMN IF NOT EXISTS tv_use_logo boolean NOT NULL DEFAULT false;
