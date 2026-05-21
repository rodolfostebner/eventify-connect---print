-- =====================================================================
-- Migração: Patrocinadores → Parceiros (Partners)
-- Data: 2026-05-24
--
-- Unifica Patrocinadores, Apoiadores e Serviços em uma única entidade
-- "partners" com um campo de tipo. Renomeia a tabela sponsors e adiciona
-- campos de uso interno (contato, valor) e flags de exibição.
-- =====================================================================

-- 1. Renomeia sponsors → partners (guardado para ser reexecutável)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sponsors')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'partners') THEN
    ALTER TABLE sponsors RENAME TO partners;
  END IF;
END $$;

-- 2. Novos campos
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'patrocinador'
    CHECK (type IN ('patrocinador', 'apoiador', 'servico')),
  -- Contato interno (até ~4 nomes + 4 telefones). NÃO exibido no app.
  ADD COLUMN IF NOT EXISTS internal_contact text,
  -- Valor do patrocínio (uso interno / relatório financeiro). Só p/ tipo patrocinador.
  ADD COLUMN IF NOT EXISTS sponsorship_value numeric(12,2),
  ADD COLUMN IF NOT EXISTS show_on_tv   boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_on_feed boolean NOT NULL DEFAULT true;

-- 3. Renomeia índices e ajusta policy (idempotente)
ALTER INDEX IF EXISTS sponsors_event_id_idx RENAME TO partners_event_id_idx;
ALTER INDEX IF EXISTS sponsors_active_idx   RENAME TO partners_active_idx;
CREATE INDEX IF NOT EXISTS partners_type_idx ON partners(type);

DROP POLICY IF EXISTS "sponsors_all" ON partners;
DROP POLICY IF EXISTS "partners_all" ON partners;
CREATE POLICY "partners_all" ON partners FOR ALL USING (true) WITH CHECK (true);
