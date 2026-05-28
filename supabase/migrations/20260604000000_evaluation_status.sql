-- =====================================================================
-- Migração: Controle de estado das avaliações de jurados
-- Data: 2026-06-04
--
-- Adiciona coluna evaluation_status em events para controlar o ciclo:
--   open      → avaliações abertas (avaliadores podem submeter e alterar)
--   closed    → encerradas pelo admin (cálculo de ranking, mesa redonda)
--   published → ranking publicado na tela de pós-evento (encerramento oficial)
-- =====================================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS evaluation_status text NOT NULL DEFAULT 'open'
    CONSTRAINT events_evaluation_status_check
      CHECK (evaluation_status IN ('open', 'closed', 'published'));

-- Permissões para anon e authenticated (mesmo padrão das colunas existentes)
GRANT UPDATE(evaluation_status) ON events TO anon, authenticated;
