-- Concede permissão de leitura na view de ranking para os roles do Supabase
GRANT SELECT ON view_exhibitor_rankings TO anon, authenticated;
