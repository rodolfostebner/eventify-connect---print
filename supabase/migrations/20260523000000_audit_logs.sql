-- =====================================================================
-- Migração: Log de Auditoria de Alterações do Evento
-- Data: 2026-05-23
--
-- Registra quem alterou o quê na administração do evento.
-- Pré-requisitos: tabelas events, users já existem.
-- Executar via Supabase SQL Editor ou `supabase db push`.
-- =====================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  -- Autor da alteração. SET NULL preserva o histórico se o usuário for removido.
  user_id    text        REFERENCES users(id) ON DELETE SET NULL,
  -- Snapshots: mantêm a identidade do autor mesmo se o usuário mudar/sumir.
  user_name  text,
  user_email text,
  action     text        NOT NULL,
  -- Diff no formato { campo: { before, after } }
  changes    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_event_idx      ON audit_logs(event_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);

-- RLS — mesmo padrão permissivo das demais tabelas
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_all" ON audit_logs;
CREATE POLICY "audit_logs_all" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
