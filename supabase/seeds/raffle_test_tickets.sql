-- =============================================================
-- Seed: 6 tickets de teste para sorteio
-- Rode no SQL Editor do Supabase (https://supabase.com/dashboard)
-- =============================================================

-- 1. Fix de permissões (necessário uma única vez)
GRANT SELECT, INSERT, UPDATE, DELETE ON evaluation_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON evaluations            TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON juror_evaluations      TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON raffle_tickets         TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON visits                 TO anon, authenticated;

-- 2. Insere usuários e tickets em um único CTE
WITH target_event AS (
  -- Usa o evento mais recente. Para outro evento, troque por:
  -- SELECT id FROM events WHERE slug = 'seu-slug'
  SELECT id FROM events ORDER BY created_at DESC LIMIT 1
),
upserted_users AS (
  INSERT INTO users (email, display_name, role)
  VALUES
    ('denisddc@gmail.com',              'Denis',          'participant'),
    ('ana.elizabeth@eventify.test',     'Ana Elizabeth',  'participant'),
    ('anne.stebner@eventify.test',      'Anne Stebner',   'participant'),
    ('rodolfo@eventify.test',           'Rodolfo',        'participant'),
    ('cibelle@eventify.test',           'Cibelle',        'participant'),
    ('melody@eventify.test',            'Melody',         'participant')
  ON CONFLICT (email) DO UPDATE
    SET display_name = EXCLUDED.display_name
  RETURNING id
)
INSERT INTO raffle_tickets (event_id, user_id)
SELECT e.id, u.id
FROM upserted_users u
CROSS JOIN target_event e
ON CONFLICT (event_id, user_id) DO NOTHING;

-- 3. Confirma o resultado
SELECT
  rt.id AS ticket_id,
  u.display_name,
  u.email,
  e.name AS evento
FROM raffle_tickets rt
JOIN users  u ON u.id = rt.user_id
JOIN events e ON e.id = rt.event_id
WHERE u.email LIKE '%@eventify.test' OR u.email = 'denisddc@gmail.com'
ORDER BY u.display_name;
