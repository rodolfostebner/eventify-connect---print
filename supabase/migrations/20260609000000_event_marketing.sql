-- Marketing do evento: contato + slides de fotos para o TV Panel

CREATE TABLE event_marketing (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  instagram  text,
  phone      text,
  email      text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id)
);

CREATE TABLE event_marketing_photos (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id    uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url   text        NOT NULL,
  phrase      text,
  text        text,
  order_index int         NOT NULL DEFAULT 0,
  active      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_event_marketing_photos_event ON event_marketing_photos(event_id);

-- RLS
ALTER TABLE event_marketing        ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_marketing_photos ENABLE ROW LEVEL SECURITY;

-- Leitura pública (telão e feed usam anon)
CREATE POLICY "event_marketing_select_public" ON event_marketing
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "event_marketing_photos_select_public" ON event_marketing_photos
  FOR SELECT TO anon, authenticated USING (true);

-- Escrita: anon + authenticated (BETA_MODE usa anon key, sem sessão Supabase Auth)
CREATE POLICY "event_marketing_write_auth" ON event_marketing
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "event_marketing_photos_write_auth" ON event_marketing_photos
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON event_marketing        TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_marketing_photos TO anon, authenticated;
