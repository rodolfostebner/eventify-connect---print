CREATE TABLE IF NOT EXISTS contact_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',  -- new | contacted | closed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;

-- No padrão do projeto, devido ao VITE_BETA_MODE que simula login sem autenticação oficial do Supabase Auth,
-- as tabelas usam USING (true) para permitir que o cliente acesse os dados corretamente em desenvolvimento.
CREATE POLICY "contact_leads_all" ON contact_leads FOR ALL USING (true) WITH CHECK (true);

-- Permissões de acesso para as roles anon e authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_leads TO anon, authenticated;
