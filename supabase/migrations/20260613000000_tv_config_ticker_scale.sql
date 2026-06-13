-- Tamanho do rodapé (ticker) do telão, em %: escala a altura, o texto e as
-- miniaturas da barra inferior proporcionalmente. 100 = padrão, 200 = dobro.
-- Ajustado no painel de controle (seção Ticker).

ALTER TABLE tv_config
  ADD COLUMN IF NOT EXISTS ticker_scale integer NOT NULL DEFAULT 100;
