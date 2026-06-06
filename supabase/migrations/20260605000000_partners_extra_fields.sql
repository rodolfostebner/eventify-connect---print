-- =====================================================================
-- Migração: campos extras de Parceiros (Partners)
-- Data: 2026-06-05
--
-- - Adiciona logo dedicada (logo_url)
-- - Adiciona redes sociais TikTok e YouTube
-- - Adiciona contatos públicos email e telefone
-- - Remove o campo de contato interno (internal_contact)
-- =====================================================================

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS logo_url   text,
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS email      text,
  ADD COLUMN IF NOT EXISTS phone      text;

-- Remove o contato interno (substituído por email/telefone públicos)
ALTER TABLE partners
  DROP COLUMN IF EXISTS internal_contact;
