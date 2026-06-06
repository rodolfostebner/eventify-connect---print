-- =============================================================
-- backup_base_testes.sql
--
-- Tira um SNAPSHOT das tabelas que o limpa_base_testes.sql apaga,
-- copiando-as para o schema `bkp` ANTES de rodar a limpeza.
--
-- COMO USAR: cole no SQL Editor do Supabase e execute ANTES da limpeza.
-- Restauração: veja o bloco comentado no final deste arquivo.
--
-- Observação: roda inteiro no banco (sem CLI / pg_dump). Recria o schema
-- `bkp` do zero a cada execução — o snapshot anterior é descartado.
-- =============================================================

BEGIN;

-- Recria o schema de backup do zero (descarta snapshot anterior)
DROP SCHEMA IF EXISTS bkp CASCADE;
CREATE SCHEMA bkp;

-- ── Feed e interações ───────────────────────────────────────────────
CREATE TABLE bkp.reactions         AS SELECT * FROM public.reactions;
CREATE TABLE bkp.comments          AS SELECT * FROM public.comments;
CREATE TABLE bkp.photo_views       AS SELECT * FROM public.photo_views;
CREATE TABLE bkp.posts             AS SELECT * FROM public.posts;

-- ── Pedidos de impressão ────────────────────────────────────────────
CREATE TABLE bkp.print_order_items AS SELECT * FROM public.print_order_items;
CREATE TABLE bkp.print_orders      AS SELECT * FROM public.print_orders;

-- ── Visitas, leads e avaliações ─────────────────────────────────────
CREATE TABLE bkp.visits            AS SELECT * FROM public.visits;
CREATE TABLE bkp.leads             AS SELECT * FROM public.leads;
CREATE TABLE bkp.evaluations       AS SELECT * FROM public.evaluations;
CREATE TABLE bkp.juror_evaluations AS SELECT * FROM public.juror_evaluations;

-- ── Notificações e auditoria ────────────────────────────────────────
CREATE TABLE bkp.notifications     AS SELECT * FROM public.notifications;
CREATE TABLE bkp.audit_logs        AS SELECT * FROM public.audit_logs;

-- ── Sorteio ─────────────────────────────────────────────────────────
CREATE TABLE bkp.raffle_tickets    AS SELECT * FROM public.raffle_tickets;
CREATE TABLE bkp.raffle_prizes     AS SELECT * FROM public.raffle_prizes;

-- ── Anúncios ────────────────────────────────────────────────────────
CREATE TABLE bkp.announcements     AS SELECT * FROM public.announcements;

-- ── Eventos (a limpeza ALTERA colunas: tv_raffle_prize_id, tv_raffle_state,
--    announcement_trigger_at). Snapshot completo p/ poder restaurar esses campos.
CREATE TABLE bkp.events            AS SELECT * FROM public.events;

COMMIT;

-- Conferência rápida (rode separado se quiser):
-- SELECT 'posts' t, count(*) FROM bkp.posts
-- UNION ALL SELECT 'evaluations', count(*) FROM bkp.evaluations
-- UNION ALL SELECT 'juror_evaluations', count(*) FROM bkp.juror_evaluations
-- UNION ALL SELECT 'visits', count(*) FROM bkp.visits;


-- =============================================================
-- RESTAURAÇÃO (rodar só se precisar desfazer a limpeza)
-- Reinsere os dados a partir do snapshot. ON CONFLICT DO NOTHING evita
-- erro caso alguma linha já exista. Respeita a ordem de FKs.
-- =============================================================
/*
BEGIN;

-- Pais primeiro (respeitando FKs):
--   raffle_tickets ANTES de raffle_prizes (winner_ticket_id -> raffle_tickets)
INSERT INTO public.posts             SELECT * FROM bkp.posts             ON CONFLICT DO NOTHING;
INSERT INTO public.print_orders      SELECT * FROM bkp.print_orders      ON CONFLICT DO NOTHING;
INSERT INTO public.raffle_tickets    SELECT * FROM bkp.raffle_tickets    ON CONFLICT DO NOTHING;
INSERT INTO public.raffle_prizes     SELECT * FROM bkp.raffle_prizes     ON CONFLICT DO NOTHING;
INSERT INTO public.announcements     SELECT * FROM bkp.announcements     ON CONFLICT DO NOTHING;

-- Filhos depois
INSERT INTO public.reactions         SELECT * FROM bkp.reactions         ON CONFLICT DO NOTHING;
INSERT INTO public.comments          SELECT * FROM bkp.comments          ON CONFLICT DO NOTHING;
INSERT INTO public.photo_views       SELECT * FROM bkp.photo_views       ON CONFLICT DO NOTHING;
INSERT INTO public.print_order_items SELECT * FROM bkp.print_order_items ON CONFLICT DO NOTHING;
INSERT INTO public.visits            SELECT * FROM bkp.visits            ON CONFLICT DO NOTHING;
INSERT INTO public.leads             SELECT * FROM bkp.leads             ON CONFLICT DO NOTHING;
INSERT INTO public.evaluations       SELECT * FROM bkp.evaluations       ON CONFLICT DO NOTHING;
INSERT INTO public.juror_evaluations SELECT * FROM bkp.juror_evaluations ON CONFLICT DO NOTHING;
INSERT INTO public.notifications     SELECT * FROM bkp.notifications     ON CONFLICT DO NOTHING;
INSERT INTO public.audit_logs        SELECT * FROM bkp.audit_logs        ON CONFLICT DO NOTHING;

-- Restaura os campos do evento que a limpeza zerou
UPDATE public.events e
   SET tv_raffle_prize_id     = b.tv_raffle_prize_id,
       tv_raffle_state        = b.tv_raffle_state,
       announcement_trigger_at = b.announcement_trigger_at
  FROM bkp.events b
 WHERE e.id = b.id;

COMMIT;
*/

-- Para descartar o backup depois que tudo estiver OK:
-- DROP SCHEMA IF EXISTS bkp CASCADE;
