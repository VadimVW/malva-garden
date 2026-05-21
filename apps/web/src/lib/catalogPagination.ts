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

export function parseCatalogQuery(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" ? value.trim() : "";
}

import {
  DEFAULT_CATALOG_SORT,
  shouldIncludeSortInUrl,
  type CatalogSort,
} from "@/lib/catalogSort";

export type CatalogUrlQuery = {
  q?: string;
  sort?: CatalogSort;
};

export function buildCatalogUrlQuery(options: {
  q?: string;
  sort?: CatalogSort;
}): CatalogUrlQuery | undefined {
  const query: CatalogUrlQuery = {};
  const trimmedQ = options.q?.trim();
  if (trimmedQ) query.q = trimmedQ;
  const sort = options.sort ?? DEFAULT_CATALOG_SORT;
  if (shouldIncludeSortInUrl(sort)) query.sort = sort;
  return Object.keys(query).length > 0 ? query : undefined;
}

export function getCatalogPageHref(
  basePath: string,
  page: number,
  query?: CatalogUrlQuery,
): string {
  const path = basePath.replace(/\/$/, "") || "/";
  const params = new URLSearchParams();
  const q = query?.q?.trim();
  if (q) params.set("q", q);
  if (query?.sort && shouldIncludeSortInUrl(query.sort)) {
    params.set("sort", query.sort);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
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
