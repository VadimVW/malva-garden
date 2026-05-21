import { redirect } from "next/navigation";
import { fetchCatalogGrid, type CatalogGridResult } from "@/lib/catalogGridFromApi";
import {
  getCatalogPageHref,
  parseCatalogPage,
  parseCatalogQuery,
  type CatalogUrlQuery,
} from "@/lib/catalogPagination";

export async function loadCatalogPage(options: {
  basePath: string;
  categorySlug?: string;
  pageRaw?: string;
  qRaw?: string;
}): Promise<CatalogGridResult> {
  const page = parseCatalogPage(options.pageRaw);
  const q = parseCatalogQuery(options.qRaw);
  const urlQuery: CatalogUrlQuery | undefined = q ? { q } : undefined;

  const result = await fetchCatalogGrid({
    categorySlug: options.categorySlug,
    page,
    q: q || undefined,
  });

  const { totalPages } = result.pagination;
  if (totalPages > 0 && page > totalPages) {
    redirect(getCatalogPageHref(options.basePath, totalPages, urlQuery));
  }

  return result;
}
