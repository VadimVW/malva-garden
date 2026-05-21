export const CATALOG_SORT_VALUES = ["new", "price_asc", "price_desc"] as const;

export type CatalogSort = (typeof CATALOG_SORT_VALUES)[number];

export const DEFAULT_CATALOG_SORT: CatalogSort = "new";

export const CATALOG_SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "new", label: "Спочатку нові" },
  { value: "price_asc", label: "Ціна: від дешевших" },
  { value: "price_desc", label: "Ціна: від дорожчих" },
];

export function parseCatalogSort(
  raw: string | string[] | undefined | null,
): CatalogSort {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "price_asc" || value === "price_desc" || value === "new") {
    return value;
  }
  return DEFAULT_CATALOG_SORT;
}

export function catalogSortLabel(sort: CatalogSort): string {
  return (
    CATALOG_SORT_OPTIONS.find((o) => o.value === sort)?.label ??
    CATALOG_SORT_OPTIONS[0].label
  );
}

export function shouldIncludeSortInUrl(sort: CatalogSort): boolean {
  return sort !== DEFAULT_CATALOG_SORT;
}
