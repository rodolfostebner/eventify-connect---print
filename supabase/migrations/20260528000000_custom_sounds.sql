-- =====================================================================
-- Migração: Sons Personalizados por Evento
-- Data: 2026-05-28
--
-- Adiciona suporte para o cadastro de até 3 sons personalizados em cada evento.
-- =====================================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS custom_sounds jsonb DEFAULT '[]'::jsonb;
