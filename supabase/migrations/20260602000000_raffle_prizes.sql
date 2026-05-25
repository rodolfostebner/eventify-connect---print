-- Prêmios dos sorteios por evento
CREATE TABLE raffle_prizes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  order_index     INTEGER NOT NULL DEFAULT 0,
  winner_ticket_id UUID REFERENCES raffle_tickets(id),
  drawn_at        TIMESTAMPTZ,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE raffle_prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "raffle_prizes_select" ON raffle_prizes
  FOR SELECT USING (TRUE);

CREATE POLICY "raffle_prizes_insert" ON raffle_prizes
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "raffle_prizes_update" ON raffle_prizes
  FOR UPDATE USING (TRUE);

CREATE POLICY "raffle_prizes_delete" ON raffle_prizes
  FOR DELETE USING (TRUE);

-- Concede acesso explícito para anon e authenticated (padrão do projeto)
GRANT SELECT, INSERT, UPDATE, DELETE ON raffle_prizes TO anon, authenticated;

-- Estado do sorteio no telão — armazenado em events para aproveitar o realtime existente
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS tv_raffle_prize_id UUID REFERENCES raffle_prizes(id),
  ADD COLUMN IF NOT EXISTS tv_raffle_state    TEXT DEFAULT 'idle'
    CHECK (tv_raffle_state IN ('idle', 'showing_prize', 'showing_winner'));
