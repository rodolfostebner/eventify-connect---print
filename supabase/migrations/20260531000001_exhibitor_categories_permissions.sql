-- Permissões para a tabela exhibitor_categories
-- Controle de acesso feito pela aplicação (BETA_MODE usa role anon)

GRANT SELECT, INSERT, UPDATE, DELETE ON exhibitor_categories TO anon, authenticated;

-- RLS: permissão aberta (proteção é application-level, igual às demais tabelas do projeto)
ALTER TABLE exhibitor_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exhibitor_categories: acesso total"
  ON exhibitor_categories FOR ALL
  USING (true)
  WITH CHECK (true);
