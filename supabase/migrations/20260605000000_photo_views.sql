-- =====================================================================
-- Migração: Sistema de Visualizações Únicas de Fotos da Galeria
-- Autor: Winston (System Architect)
-- Data: 2026-06-05
-- =====================================================================

CREATE TABLE IF NOT EXISTS photo_views (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     uuid        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     text        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  -- Evita contagens duplicadas do mesmo usuário na mesma foto
  UNIQUE(post_id, user_id)
);

-- Habilitar RLS e criar políticas
ALTER TABLE photo_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "photo_views_all" ON photo_views;
CREATE POLICY "photo_views_all" ON photo_views FOR ALL USING (true) WITH CHECK (true);

-- Conceder permissões para roles de API do Supabase (BETA_MODE e Auth)
GRANT SELECT, INSERT, UPDATE, DELETE ON photo_views TO anon, authenticated;

