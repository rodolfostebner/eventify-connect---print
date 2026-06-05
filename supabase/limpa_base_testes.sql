-- =============================================================
-- limpa_base_testes.sql
--
-- Apaga TODOS os dados de teste/interação do banco, preparando para
-- novos testes ou para o lançamento oficial do evento. Pode ser rodado
-- quantas vezes quiser (é idempotente — DELETE/UPDATE re-executáveis).
--
-- COMO USAR: cole no SQL Editor do Supabase e execute.
-- Se algo der errado no meio, rode ROLLBACK; (o BEGIN/COMMIT garante
-- tudo-ou-nada).
--
-- ⚠️ NÃO filtra por evento — limpa os dados de TODOS os eventos.
--
-- APAGA: fotos do feed e suas interações, pedidos de impressão, visitas,
--   leads, avaliações (público e jurados), notificações, sorteio
--   (tickets + prêmios), anúncios e logs de auditoria.
--
-- MANTÉM (estrutura/config do evento): events, exhibitors, products,
--   partners, users, user_email_roles, evaluation_categories,
--   exhibitor_categories, contact_leads (mensagens de contato da landing).
--   As imagens no Cloudflare R2 também permanecem.
-- =============================================================

BEGIN;

-- ── Feed: fotos e suas interações/métricas ──────────────────────────
DELETE FROM reactions;
DELETE FROM comments;
DELETE FROM photo_views;

-- ── Pedidos de impressão (referenciam posts) ────────────────────────
DELETE FROM print_order_items;
DELETE FROM print_orders;

-- ── As fotos do feed ────────────────────────────────────────────────
DELETE FROM posts;

-- ── Visitas, leads e avaliações ─────────────────────────────────────
DELETE FROM visits;
DELETE FROM leads;
DELETE FROM evaluations;
DELETE FROM juror_evaluations;

-- ── Notificações e auditoria ────────────────────────────────────────
DELETE FROM notifications;
DELETE FROM audit_logs;

-- ── Sorteio: tickets e prêmios ──────────────────────────────────────
DELETE FROM raffle_tickets;
-- Zera a referência do prêmio no evento ANTES de apagar (FK sem ON DELETE SET NULL)
UPDATE events SET tv_raffle_prize_id = NULL, tv_raffle_state = NULL
  WHERE tv_raffle_prize_id IS NOT NULL OR tv_raffle_state IS NOT NULL;
DELETE FROM raffle_prizes;

-- ── Anúncios (active_announcement_id zera sozinho via FK ON DELETE SET NULL) ──
DELETE FROM announcements;
UPDATE events SET announcement_trigger_at = NULL WHERE announcement_trigger_at IS NOT NULL;

COMMIT;
