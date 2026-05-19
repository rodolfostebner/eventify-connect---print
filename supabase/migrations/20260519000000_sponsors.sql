-- Tabela de patrocinadores por evento
CREATE TABLE IF NOT EXISTS sponsors (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id      uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  description   text,
  photos        text[]      NOT NULL DEFAULT '{}',
  instagram_url text,
  whatsapp      text,
  website_url   text,
  order_index   int         NOT NULL DEFAULT 0,
  active        boolean     NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sponsors_event_id_idx ON sponsors(event_id);
CREATE INDEX IF NOT EXISTS sponsors_active_idx   ON sponsors(active);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsors_all" ON sponsors FOR ALL USING (true) WITH CHECK (true);
