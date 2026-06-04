-- =====================================================================
-- Migração: Moderação de comentários de avaliações dos expositores
-- Data: 2026-06-06
-- =====================================================================

ALTER TABLE evaluations
  ADD COLUMN IF NOT EXISTS comment_status text NOT NULL DEFAULT 'approved'
    CONSTRAINT evaluations_comment_status_check
      CHECK (comment_status IN ('pending', 'approved', 'rejected'));

-- Conceder permissões para roles de API
GRANT SELECT, INSERT, UPDATE, DELETE ON evaluations TO anon, authenticated;

-- Habilitar Realtime para a tabela evaluations
ALTER PUBLICATION supabase_realtime ADD TABLE evaluations;
