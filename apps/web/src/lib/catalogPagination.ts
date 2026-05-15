export type CatalogPaginationMeta = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
};

export function parseCatalogPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function getCatalogPageHref(basePath: string, page: number): string {
  const path = basePath.replace(/\/$/, "") || "/";
  if (page <= 1) return path;
  return `${path}?page=${page}`;
}

/** Номери сторінок і «…» для навігації каталогу. */
export function buildPaginationItems(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 0) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) items.push("ellipsis");
  for (let p = left; p <= right; p++) items.push(p);
  if (right < total - 1) items.push("ellipsis");
  if (total > 1) items.push(total);

  return items;
}
