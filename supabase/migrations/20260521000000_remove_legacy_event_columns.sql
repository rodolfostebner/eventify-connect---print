-- Remove colunas JSONB legadas substituídas pelas tabelas dedicadas
-- exhibitors → tabela exhibitors (migration 20260512)
-- sponsors   → tabela sponsors   (migration 20260519)
ALTER TABLE events DROP COLUMN IF EXISTS exhibitors;
ALTER TABLE events DROP COLUMN IF EXISTS sponsors;
