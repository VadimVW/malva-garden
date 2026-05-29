/** Мінімальна довжина `q` для fallback на pg_trgm (коротші — лише підрядок). */
export const SEARCH_FUZZY_MIN_QUERY_LENGTH = 3;

/**
 * Поріг `similarity(name, q)` у PostgreSQL (pg_trgm), діапазон 0…1.
 * Нижче — більше «схожих» результатів (ризик сміття), вище — суворіше.
 * Підбирається на seed-каталозі (~160 товарів); див. docs/SEARCH_FUZZY_PLAN.md.
 */
export const SEARCH_TRGM_SIMILARITY_THRESHOLD = 0.25;

export function normalizeProductSearchQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}
