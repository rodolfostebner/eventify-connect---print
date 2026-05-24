-- Cria tabela dedicada de categorias de expositor por evento
-- Substitui o array de texto em events.exhibitor_categories

CREATE TABLE exhibitor_categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  icon        text        NOT NULL DEFAULT '🏷️',
  color       text        NOT NULL DEFAULT '#94949E',
  order_index integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, name)
);

-- Migra dados existentes de events.exhibitor_categories[]
INSERT INTO exhibitor_categories (event_id, name, icon, color, order_index)
SELECT
  e.id,
  u.cat_name,
  CASE
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%gastro%','%aliment%','%comida%','%salgado%','%doce%','%confeit%','%lanch%','%pizza%','%açaí%','%bebid%']) THEN '🍔'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%moda%','%roupa%','%fashion%','%vestuár%','%calçad%','%acess%']) THEN '👗'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%tecn%','%tech%','%digital%','%software%','%robót%','%app%','%game%']) THEN '💻'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%artesanat%','%craft%','%bordad%','%crochê%','%tricô%','%costur%','%vela%']) THEN '🎨'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%servi%','%service%','%consert%','%manutenç%','%repar%']) THEN '🛠️'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%beleza%','%beauty%','%estétic%','%manicur%','%esmalte%','%sobrancel%','%cabelo%']) THEN '💅'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%saúde%','%bem%estar%','%wellness%','%yoga%','%medit%','%natur%']) THEN '🌿'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%educa%','%escola%','%ensino%','%curso%','%livr%']) THEN '📚'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%esport%','%sport%','%gym%','%academia%','%fit%']) THEN '⚽'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%mús%','%music%','%entret%','%show%','%cultur%']) THEN '🎵'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%pet%','%animal%','%cão%','%gato%','%bich%']) THEN '🐶'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%flor%','%plant%','%jardim%','%horta%']) THEN '🌺'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%decor%','%casa%','%móv%','%home%']) THEN '🏠'
    ELSE '🏷️'
  END,
  CASE
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%gastro%','%aliment%','%comida%','%salgado%','%doce%','%lanch%']) THEN '#E87A5C'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%moda%','%roupa%','%fashion%','%vestuár%']) THEN '#C77DBA'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%tecn%','%tech%','%digital%','%robót%']) THEN '#5B8FE8'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%artesanat%','%craft%','%bordad%']) THEN '#E8B85B'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%servi%','%service%']) THEN '#7B7BE8'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%beleza%','%beauty%','%estétic%']) THEN '#E85B8A'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%saúde%','%bem%estar%','%wellness%']) THEN '#5BC0A8'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%educa%','%escola%']) THEN '#3B82F6'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%esport%','%sport%']) THEN '#3FA790'
    WHEN lower(u.cat_name) ILIKE ANY(ARRAY['%mús%','%music%','%entret%']) THEN '#7C3AED'
    ELSE '#94949E'
  END,
  (u.ordinality - 1)::integer
FROM events e,
     unnest(e.exhibitor_categories) WITH ORDINALITY AS u(cat_name, ordinality)
WHERE e.exhibitor_categories IS NOT NULL
  AND array_length(e.exhibitor_categories, 1) > 0
ON CONFLICT (event_id, name) DO NOTHING;

-- Adiciona FK category_id na tabela exhibitors
ALTER TABLE exhibitors
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES exhibitor_categories(id) ON DELETE SET NULL;

-- Mapeia exhibitors existentes para o novo category_id pelo nome
UPDATE exhibitors ex
SET category_id = ec.id
FROM exhibitor_categories ec
WHERE ec.event_id = ex.event_id
  AND lower(ec.name) = lower(ex.category)
  AND ex.category IS NOT NULL
  AND ex.category <> '';

-- Remove coluna legada de events
ALTER TABLE events
  DROP COLUMN IF EXISTS exhibitor_categories;
