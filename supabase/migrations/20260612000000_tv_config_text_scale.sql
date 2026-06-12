-- Tamanho do texto do telão (em %): escala global de todos os textos dos
-- módulos/header/ticker, ajustada no painel de controle. 100 = padrão.
-- Útil quando a TV exibe partes pequenas demais (ex: projeção em TVs grandes).

ALTER TABLE tv_config
  ADD COLUMN IF NOT EXISTS text_scale integer NOT NULL DEFAULT 100;
