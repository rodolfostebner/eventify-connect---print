-- =====================================================================
-- Migração: Sistema de Avaliações, Rankings, Tickets de Sorteio e Analytics
-- Autor: Winston (System Architect) + Amelia (Dev)
-- Data: 2026-05-22
--
-- Pré-requisitos: tabelas events, exhibitors, users, products já existem.
-- Executar via Supabase SQL Editor ou `supabase db push`.
-- =====================================================================

-- 1. Estender a tabela de eventos com pesos de avaliação
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS public_evaluation_weight numeric(3,2) NOT NULL DEFAULT 0.40,
  ADD COLUMN IF NOT EXISTS juror_evaluation_weight  numeric(3,2) NOT NULL DEFAULT 0.60;

-- 2. Categorias de Avaliação Técnica (jurados)
-- Dinâmicas por evento — Admin Geral define no cadastro do evento.
-- Ex.: 'Melhor Atendimento', 'Criatividade', 'Organização',
--      'Produto de qualidade', 'Decoração', 'Apresentação'
CREATE TABLE IF NOT EXISTS evaluation_categories (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  weight     numeric(3,2) NOT NULL DEFAULT 1.00,
  order_index int        NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS eval_categories_event_idx ON evaluation_categories(event_id);

-- 3. Avaliações do Público Comum (1 a 5 estrelas + comentário)
-- REGRA [RN1]: Apenas 1 avaliação por participante por expositor
CREATE TABLE IF NOT EXISTS evaluations (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  exhibitor_id uuid        NOT NULL REFERENCES exhibitors(id) ON DELETE CASCADE,
  user_id      text        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stars        int         NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment      text,
  created_at   timestamptz DEFAULT now(),
  -- Anti-fraude: impede múltiplas avaliações do mesmo usuário no mesmo expositor
  UNIQUE(exhibitor_id, user_id)
);

CREATE INDEX IF NOT EXISTS evaluations_event_idx     ON evaluations(event_id);
CREATE INDEX IF NOT EXISTS evaluations_exhibitor_idx ON evaluations(exhibitor_id);
CREATE INDEX IF NOT EXISTS evaluations_user_idx      ON evaluations(user_id);

-- 4. Avaliações Técnicas dos Jurados/Avaliadores (nota por categoria)
-- REGRA: Jurado avalia cada categoria de cada expositor apenas 1 vez
CREATE TABLE IF NOT EXISTS juror_evaluations (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  exhibitor_id uuid        NOT NULL REFERENCES exhibitors(id) ON DELETE CASCADE,
  user_id      text        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  uuid        NOT NULL REFERENCES evaluation_categories(id) ON DELETE CASCADE,
  score        numeric(3,2) NOT NULL CHECK (score >= 0.00 AND score <= 5.00),
  created_at   timestamptz DEFAULT now(),
  -- Integridade: 1 nota por jurado por expositor por categoria
  UNIQUE(exhibitor_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS juror_evals_event_idx     ON juror_evaluations(event_id);
CREATE INDEX IF NOT EXISTS juror_evals_exhibitor_idx ON juror_evaluations(exhibitor_id);
CREATE INDEX IF NOT EXISTS juror_evals_category_idx  ON juror_evaluations(category_id);
CREATE INDEX IF NOT EXISTS juror_evals_user_idx      ON juror_evaluations(user_id);

-- 5. Tickets de Sorteio
-- REGRA: Exatamente 1 ticket por participante por evento
CREATE TABLE IF NOT EXISTS raffle_tickets (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    text        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS raffle_tickets_event_idx ON raffle_tickets(event_id);
CREATE INDEX IF NOT EXISTS raffle_tickets_user_idx  ON raffle_tickets(user_id);

-- 6. Analytics de Visitas/Cliques (relatório pós-evento — não afeta ranking)
CREATE TABLE IF NOT EXISTS visits (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  exhibitor_id uuid        REFERENCES exhibitors(id) ON DELETE CASCADE,
  product_id   uuid        REFERENCES products(id) ON DELETE CASCADE,
  user_id      text        REFERENCES users(id) ON DELETE SET NULL,
  session_id   text,
  action       text        NOT NULL CHECK (action IN (
    'view_stand', 'view_product', 'click_lead', 'click_instagram',
    'click_whatsapp', 'click_website', 'share'
  )),
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visits_event_idx      ON visits(event_id);
CREATE INDEX IF NOT EXISTS visits_exhibitor_idx  ON visits(exhibitor_id);
CREATE INDEX IF NOT EXISTS visits_product_idx    ON visits(product_id);
CREATE INDEX IF NOT EXISTS visits_action_idx     ON visits(action);
CREATE INDEX IF NOT EXISTS visits_created_at_idx ON visits(created_at);

-- 6b. RPC: resumo de visitas por ação para um expositor (agrega no banco)
-- Usada por visitService.getExhibitorVisitSummary(); há fallback no cliente.
CREATE OR REPLACE FUNCTION get_exhibitor_visit_summary(p_exhibitor_id uuid)
RETURNS TABLE(action text, count bigint)
LANGUAGE sql STABLE AS $$
  SELECT action, COUNT(*) AS count
  FROM visits
  WHERE exhibitor_id = p_exhibitor_id
  GROUP BY action;
$$;

-- 7. RLS — mesmo padrão permissivo das tabelas existentes
ALTER TABLE evaluation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE juror_evaluations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_tickets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits                ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eval_categories_all" ON evaluation_categories;
DROP POLICY IF EXISTS "evaluations_all"     ON evaluations;
DROP POLICY IF EXISTS "juror_evals_all"     ON juror_evaluations;
DROP POLICY IF EXISTS "raffle_tickets_all"  ON raffle_tickets;
DROP POLICY IF EXISTS "visits_all"          ON visits;

CREATE POLICY "eval_categories_all" ON evaluation_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "evaluations_all"     ON evaluations           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "juror_evals_all"     ON juror_evaluations     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "raffle_tickets_all"  ON raffle_tickets        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "visits_all"          ON visits                FOR ALL USING (true) WITH CHECK (true);

-- 8. View de Ranking — cálculo ponderado em tempo real
-- Usa os pesos definidos em events.public_evaluation_weight / juror_evaluation_weight
-- Consulta: SELECT * FROM view_exhibitor_rankings WHERE event_id = '<uuid>'
CREATE OR REPLACE VIEW view_exhibitor_rankings AS
WITH public_scores AS (
  SELECT
    exhibitor_id,
    AVG(stars)::numeric(3,2) AS avg_public_stars,
    COUNT(id)                AS total_public_votes
  FROM evaluations
  GROUP BY exhibitor_id
),
juror_scores AS (
  SELECT
    je.exhibitor_id,
    -- Média ponderada: (soma de score*weight) / (soma de weights)
    CASE
      WHEN SUM(ec.weight) > 0
      THEN (SUM(je.score * ec.weight) / SUM(ec.weight))::numeric(3,2)
      ELSE 0.00
    END AS avg_juror_score,
    COUNT(DISTINCT je.user_id) AS total_jurors_voted
  FROM juror_evaluations je
  JOIN evaluation_categories ec ON ec.id = je.category_id
  GROUP BY je.exhibitor_id
)
SELECT
  ex.id          AS exhibitor_id,
  ex.name        AS exhibitor_name,
  ex.number      AS exhibitor_number,
  ex.event_id,
  COALESCE(p.avg_public_stars, 0.00) AS public_score,
  COALESCE(j.avg_juror_score, 0.00)  AS juror_score,
  (
    (COALESCE(p.avg_public_stars, 0.00) * ev.public_evaluation_weight) +
    (COALESCE(j.avg_juror_score, 0.00)  * ev.juror_evaluation_weight)
  )::numeric(3,2) AS final_score,
  COALESCE(p.total_public_votes, 0) AS public_votes_count,
  COALESCE(j.total_jurors_voted, 0) AS jurors_voted_count
FROM exhibitors ex
JOIN events ev ON ev.id = ex.event_id
LEFT JOIN public_scores p ON p.exhibitor_id = ex.id
LEFT JOIN juror_scores  j ON j.exhibitor_id = ex.id
WHERE ex.status = 'active'
ORDER BY final_score DESC, ex.number ASC;
