-- =============================================================
-- Correção: GRANTs ausentes nas tabelas criadas em 20260522
-- Sem esses GRANTs, queries com a role 'anon' (BETA_MODE) ou
-- 'authenticated' retornam 0 linhas mesmo com RLS USING (true).
-- =============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON evaluation_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON evaluations            TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON juror_evaluations      TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON raffle_tickets         TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON visits                 TO anon, authenticated;
