-- Novos campos para expositores: frase chamada, ano/turma e integrantes da equipe
ALTER TABLE exhibitors
  ADD COLUMN IF NOT EXISTS tagline text CHECK (char_length(tagline) <= 50),
  ADD COLUMN IF NOT EXISTS ano     text,
  ADD COLUMN IF NOT EXISTS turma   text,
  ADD COLUMN IF NOT EXISTS members jsonb NOT NULL DEFAULT '[]'::jsonb;
