-- Fotos de demonstração para testar o telão (tema pop-yearbook) no evento fe2026.
-- Idempotente: limpa as fotos demo antes de reinserir (marca via user_id 'demo-tv').

DO $$
DECLARE
  ev uuid;
  authors text[] := ARRAY[
    '6c07ba73-b561-4752-ba70-15715dd3328e',
    '8ea1fc1c-05f0-4514-963d-94653343d30e',
    'c80934df-f748-43d6-9dc1-e83777d36a3a',
    'dfce6ab1-0c07-4a4e-b6f8-6137a0baeae3',
    '0201663d-0407-4476-8412-f4c7c07bf9e9'
  ];
  emojis text[] := ARRAY['🔥','😍','😂','👏','😮','❤️'];
  pid uuid;
  i int;
  j int;
  n_react int;
  dom text;
BEGIN
  SELECT id INTO ev FROM events WHERE slug = 'fe2026';
  IF ev IS NULL THEN RAISE NOTICE 'evento fe2026 não encontrado'; RETURN; END IF;

  -- Limpa demo anterior
  DELETE FROM posts WHERE event_id = ev AND user_id LIKE 'demo-tv%';

  FOR i IN 1..8 LOOP
    pid := gen_random_uuid();
    INSERT INTO posts (id, event_id, user_id, image_url, status, is_official, created_at)
    VALUES (
      pid, ev,
      'demo-tv:' || authors[1 + (i % array_length(authors,1))],
      'https://picsum.photos/seed/fetv' || i || '/800/800',
      'approved',
      (i <= 2),                       -- 2 primeiras como oficiais
      now() - (i || ' minutes')::interval
    );

    -- Reações: emoji dominante varia por foto, contagem decrescente para formar ranking
    dom := emojis[1 + (i % array_length(emojis,1))];
    n_react := GREATEST(1, 14 - i);   -- foto 1 mais reagida, decai
    FOR j IN 1..n_react LOOP
      INSERT INTO reactions (post_id, user_id, type)
      VALUES (pid, 'demo-react:' || i || '-' || j, dom)
      ON CONFLICT DO NOTHING;
    END LOOP;
    -- Algumas reações secundárias para dar variedade
    FOR j IN 1..(i % 4) LOOP
      INSERT INTO reactions (post_id, user_id, type)
      VALUES (pid, 'demo-react2:' || i || '-' || j, emojis[1 + ((i+2) % array_length(emojis,1))])
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Fotos demo inseridas para fe2026';
END $$;
