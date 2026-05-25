-- =============================================================
-- Seed: 6 tickets de teste para sorteio
-- Rode no SQL Editor do Supabase (https://supabase.com/dashboard)
-- O script usa o evento mais recente automaticamente.
-- Se quiser um evento específico, substitua a 1ª linha do bloco DO.
-- =============================================================

-- Fix: GRANTs ausentes em raffle_tickets (e tabelas irmãs da mesma migration)
-- Sem isso, queries com role 'anon' (BETA_MODE) retornam 0 mesmo com RLS aberto.
GRANT SELECT, INSERT, UPDATE, DELETE ON evaluation_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON evaluations            TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON juror_evaluations      TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON raffle_tickets         TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON visits                 TO anon, authenticated;

DO $$
DECLARE
  v_event_id  UUID;
  v_user_id   UUID;

  -- Participantes de teste
  test_names  TEXT[] := ARRAY[
    'Denis',
    'Ana Elizabeth',
    'Anne Stebner',
    'Rodolfo',
    'Cibelle',
    'Melody'
  ];
  test_emails TEXT[] := ARRAY[
    'denisddc@gmail.com',
    'ana.elizabeth@eventify.test',
    'anne.stebner@eventify.test',
    'rodolfo@eventify.test',
    'cibelle@eventify.test',
    'melody@eventify.test'
  ];

  i INT;
BEGIN
  -- Pega o evento mais recente (troque por: SELECT id FROM events WHERE slug = 'seu-slug')
  SELECT id INTO v_event_id
  FROM events
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_event_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum evento encontrado. Crie um evento antes de rodar este seed.';
  END IF;

  RAISE NOTICE 'Usando evento: %', v_event_id;

  FOR i IN 1..array_length(test_names, 1) LOOP

    -- Cria o usuário se não existir; se existir, atualiza o display_name
    INSERT INTO users (email, display_name, role, supabase_user_id)
    VALUES (test_emails[i], test_names[i], 'participant', NULL)
    ON CONFLICT (email) DO UPDATE
      SET display_name = EXCLUDED.display_name
    RETURNING id INTO v_user_id;

    -- Cria o ticket (ignora silenciosamente se já existir)
    INSERT INTO raffle_tickets (event_id, user_id)
    VALUES (v_event_id, v_user_id)
    ON CONFLICT (event_id, user_id) DO NOTHING;

    RAISE NOTICE 'Ticket criado: % (%)', test_names[i], test_emails[i];

  END LOOP;

  RAISE NOTICE 'Concluído — 6 tickets adicionados ao evento %', v_event_id;
END $$;
