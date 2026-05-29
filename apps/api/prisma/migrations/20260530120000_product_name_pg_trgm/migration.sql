-- Fuzzy search on product name (§7.18)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx"
  ON "Product"
  USING gin (name gin_trgm_ops);
