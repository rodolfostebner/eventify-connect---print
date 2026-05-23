-- =====================================================================
-- Migração: Criação da Tabela announcements (Avisos) e extensão de events
-- Data: 2026-05-27
--
-- Adiciona suporte para o cadastro e exibição de avisos em tempo real
-- com controle multicanal (Telão TV, Popup no App, Notificações Push).
-- =====================================================================

-- 1. Criação da tabela de avisos cadastrados
CREATE TABLE IF NOT EXISTS announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  bg_color text DEFAULT '#ef4444',
  text_color text DEFAULT '#ffffff',
  icon text DEFAULT 'megaphone',
  image_url text DEFAULT NULL,
  audio_url text DEFAULT NULL,
  show_duration_sec integer DEFAULT 15,
  
  -- Flags de Canais de Destino
  target_tv boolean NOT NULL DEFAULT true,
  target_app_popup boolean NOT NULL DEFAULT false,
  target_push boolean NOT NULL DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Adiciona colunas de controle de aviso ativo na tabela de eventos
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS active_announcement_id uuid REFERENCES announcements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS announcement_trigger_at timestamptz NULL;

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS announcements_event_id_idx ON announcements(event_id);

-- 4. Habilita RLS e cria a política padrão de permissões totais (conforme padrão do projeto)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "announcements_all" ON announcements;
CREATE POLICY "announcements_all" ON announcements FOR ALL USING (true) WITH CHECK (true);
