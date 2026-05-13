-- =============================================================
-- Migração: Sistema de Expositores
-- Executar no Supabase SQL Editor
-- =============================================================

-- 1. Expositores (normalizado — substitui JSONB em events.exhibitors)
CREATE TABLE IF NOT EXISTS exhibitors (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id      uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  number        int         NOT NULL DEFAULT 1,
  name          text        NOT NULL,
  description   text,
  logo_url      text,
  photo_url     text,
  message       text,
  final_message text,
  instagram_url text,
  whatsapp      text,
  website_url   text,
  status        text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exhibitors_event_id_idx ON exhibitors(event_id);
CREATE INDEX IF NOT EXISTS exhibitors_status_idx   ON exhibitors(status);

-- 2. Usuários de expositores (Supabase Auth exclusivo — separado do Firebase)
CREATE TABLE IF NOT EXISTS exhibitor_users (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibitor_id     uuid        NOT NULL REFERENCES exhibitors(id) ON DELETE CASCADE,
  supabase_user_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username         text        NOT NULL,
  created_at       timestamptz DEFAULT now(),
  UNIQUE(username),
  UNIQUE(exhibitor_id, supabase_user_id)
);

CREATE INDEX IF NOT EXISTS exhibitor_users_exhibitor_idx ON exhibitor_users(exhibitor_id);
CREATE INDEX IF NOT EXISTS exhibitor_users_user_idx      ON exhibitor_users(supabase_user_id);

-- 3. Catálogo de produtos
CREATE TABLE IF NOT EXISTS products (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibitor_id uuid        NOT NULL REFERENCES exhibitors(id) ON DELETE CASCADE,
  name         text        NOT NULL,
  description  text,
  price        numeric(10,2),
  photos       text[]      NOT NULL DEFAULT '{}',
  active       boolean     NOT NULL DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_exhibitor_idx ON products(exhibitor_id);
CREATE INDEX IF NOT EXISTS products_active_idx    ON products(active);

-- 4. Leads de pré-venda
CREATE TABLE IF NOT EXISTS leads (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id     uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  exhibitor_id   uuid        NOT NULL REFERENCES exhibitors(id) ON DELETE CASCADE,
  customer_name  text        NOT NULL,
  customer_phone text        NOT NULL,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_exhibitor_idx ON leads(exhibitor_id);
CREATE INDEX IF NOT EXISTS leads_product_idx   ON leads(product_id);

-- 5. RLS (permissivo — mesmo padrão das tabelas existentes)
ALTER TABLE exhibitors      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitor_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exhibitors_all"      ON exhibitors      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "exhibitor_users_all" ON exhibitor_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "products_all"        ON products        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "leads_all"           ON leads           FOR ALL USING (true) WITH CHECK (true);

-- 6. Migração de dados: JSONB em events.exhibitors → tabela exhibitors
-- Compatível com coluna do tipo jsonb (array JSON) e jsonb[] (array PostgreSQL)
DO $$
DECLARE
  ev      RECORD;
  ex      jsonb;
  counter int;
BEGIN
  FOR ev IN
    SELECT id, exhibitors FROM events WHERE exhibitors IS NOT NULL
  LOOP
    counter := 1;
    BEGIN
      FOR ex IN
        SELECT value FROM jsonb_array_elements(to_jsonb(ev.exhibitors))
      LOOP
        INSERT INTO exhibitors (
          event_id, number, name, description,
          logo_url, photo_url, message, final_message,
          instagram_url, whatsapp, website_url
        ) VALUES (
          ev.id,
          counter,
          COALESCE(NULLIF(TRIM(ex->>'name'), ''), 'Expositor'),
          NULLIF(TRIM(ex->>'bio'), ''),
          NULLIF(TRIM(ex->>'logo'), ''),
          NULLIF(TRIM(ex->>'photo'), ''),
          NULLIF(TRIM(ex->>'message'), ''),
          NULLIF(TRIM(ex->>'final_message'), ''),
          NULLIF(TRIM(ex->'socials'->>'instagram'), ''),
          NULLIF(TRIM(ex->'socials'->>'whatsapp'), ''),
          NULLIF(TRIM(ex->'socials'->>'website'), '')
        );
        counter := counter + 1;
      END LOOP;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao migrar expositores do evento %: %', ev.id, SQLERRM;
    END;
  END LOOP;
END;
$$;
