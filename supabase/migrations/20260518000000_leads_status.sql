-- Adiciona campo status aos leads de pré-venda
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'novo'
    CHECK (status IN ('novo', 'atendido', 'pago', 'retirado'));

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
