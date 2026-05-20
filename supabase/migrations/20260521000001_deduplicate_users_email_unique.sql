-- =============================================================
-- Migração: Deduplica tabela users por email e adiciona UNIQUE(email)
-- Motivação: maybeSingle() silenciava PGRST116 quando havia duplicatas,
-- causando loop de criação de usuários novos a cada login.
-- Estratégia: mantém o registro mais antigo com melhor role por email.
-- =============================================================

-- 1. Deduplica: remove registros duplicados por email, mantém o mais relevante
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY email
      ORDER BY
        CASE role
          WHEN 'admin'       THEN 0
          WHEN 'event_admin' THEN 1
          WHEN 'avaliador'   THEN 2
          WHEN 'expositor'   THEN 3
          ELSE 4
        END,
        created_at ASC
    ) AS rn
  FROM users
  WHERE email IS NOT NULL
)
DELETE FROM users
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 2. Garante que emails nulos não bloqueiem o UNIQUE (nullable é excludente)
-- Adiciona UNIQUE apenas em emails não-nulos (expressão parcial)
ALTER TABLE users
  ADD CONSTRAINT users_email_unique UNIQUE (email);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
