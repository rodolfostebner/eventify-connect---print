-- =============================================================
-- Migração: Unificação de Auth — remove Firebase, centraliza em Supabase Auth
-- Todos os perfis (admin, event_admin, avaliador, expositor, participant)
-- são armazenados na tabela users com role + event_id + exhibitor_id.
-- =============================================================

-- 1. Estender tabela users com campos de role e vínculos
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS supabase_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'participant'
    CHECK (role IN ('admin', 'event_admin', 'avaliador', 'expositor', 'participant')),
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS users_supabase_user_id_idx ON users(supabase_user_id);
CREATE INDEX IF NOT EXISTS users_role_idx             ON users(role);
CREATE INDEX IF NOT EXISTS users_event_id_idx         ON users(event_id);
CREATE INDEX IF NOT EXISTS users_exhibitor_id_idx     ON users(exhibitor_id);

-- 2. Pré-cadastro de emails com roles (admin registra antes do primeiro login)
CREATE TABLE IF NOT EXISTS user_email_roles (
  email        text        PRIMARY KEY,
  role         text        NOT NULL CHECK (role IN ('admin', 'event_admin', 'avaliador', 'expositor', 'participant')),
  event_id     uuid        REFERENCES events(id) ON DELETE CASCADE,
  exhibitor_id uuid        REFERENCES exhibitors(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_email_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_email_roles_all" ON user_email_roles FOR ALL USING (true) WITH CHECK (true);

-- 3. Migrar exhibitor_users → users (preserva vínculos existentes)
INSERT INTO users (supabase_user_id, email, role, exhibitor_id)
SELECT
  eu.supabase_user_id,
  au.email,
  'expositor',
  eu.exhibitor_id
FROM exhibitor_users eu
JOIN auth.users au ON au.id = eu.supabase_user_id
ON CONFLICT (supabase_user_id) DO UPDATE
  SET role = 'expositor',
      exhibitor_id = EXCLUDED.exhibitor_id;

-- 4. Remover tabelas de auth antigas
DROP TABLE IF EXISTS exhibitor_users;

-- Seed inicial: adicionar os emails dos admins gerais do sistema.
-- Execute manualmente via Supabase SQL Editor:
-- INSERT INTO user_email_roles (email, role) VALUES ('seu@email.com', 'admin');
