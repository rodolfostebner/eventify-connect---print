-- =============================================================
-- FIX: Login quebrado em produção
-- Rodar no Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================

-- 1. Aplicar migração unified_auth (idempotente — safe para re-executar)
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

-- 2. Criar tabela user_email_roles (pré-cadastro de papéis)
CREATE TABLE IF NOT EXISTS user_email_roles (
  email        text        PRIMARY KEY,
  role         text        NOT NULL CHECK (role IN ('admin', 'event_admin', 'avaliador', 'expositor', 'participant')),
  event_id     uuid        REFERENCES events(id) ON DELETE CASCADE,
  exhibitor_id uuid        REFERENCES exhibitors(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_email_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_email_roles' AND policyname = 'user_email_roles_all'
  ) THEN
    CREATE POLICY "user_email_roles_all" ON user_email_roles FOR ALL USING (true) WITH CHECK (true);
  END IF;
END;
$$;

-- 3. RLS permissivo na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_all'
  ) THEN
    CREATE POLICY "users_all" ON users FOR ALL USING (true) WITH CHECK (true);
  END IF;
END;
$$;

-- 4. Migrar exhibitor_users → users (preserva vínculos existentes)
-- ATENÇÃO: só executa se exhibitor_users ainda existir
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'exhibitor_users') THEN
    INSERT INTO users (supabase_user_id, email, role, exhibitor_id)
    SELECT eu.supabase_user_id, au.email, 'expositor', eu.exhibitor_id
    FROM exhibitor_users eu
    JOIN auth.users au ON au.id = eu.supabase_user_id
    ON CONFLICT (supabase_user_id) DO UPDATE
      SET role = 'expositor', exhibitor_id = EXCLUDED.exhibitor_id;

    DROP TABLE exhibitor_users;
  END IF;
END;
$$;

-- 5. SEED: adicionar admin geral
-- ⚠️  ALTERE O EMAIL ABAIXO para o seu email do Google
INSERT INTO user_email_roles (email, role)
VALUES ('denisddc@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Se o usuário já existe em users (de login anterior), atualiza o role diretamente:
UPDATE users SET role = 'admin' WHERE email = 'denisddc@gmail.com';
