-- =====================================================================
-- Migração: Categoria do Expositor (dinâmica por evento)
-- Data: 2026-05-25
--
-- O expositor tem uma categoria (texto livre). A lista de categorias
-- disponíveis é configurável por evento em events.exhibitor_categories
-- (mesmo padrão de events.custom_comments), permitindo criar novas
-- categorias sem nova versão da aplicação.
-- =====================================================================

-- 1. Coluna de categoria no expositor (texto livre, sem CHECK fixo)
ALTER TABLE exhibitors
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Outros';

-- Remove qualquer CHECK fixo de versão anterior (categorias agora são dinâmicas)
ALTER TABLE exhibitors DROP CONSTRAINT IF EXISTS exhibitors_category_check;

CREATE INDEX IF NOT EXISTS exhibitors_category_idx ON exhibitors(category);

-- 2. Lista de categorias configurável por evento
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS exhibitor_categories text[] NOT NULL
    DEFAULT '{Salgados,Doces,Artesanato,Outros}';
