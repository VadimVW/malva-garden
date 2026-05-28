import { redirect } from "next/navigation";
import {
  fetchCategoryBySlug,
  type CategoryBySlugResponse,
} from "@/lib/catalogCategory";
import { fetchCatalogGrid, type CatalogGridResult } from "@/lib/catalogGridFromApi";
import {
  buildCatalogUrlQuery,
  getCatalogPageHref,
  parseCatalogPage,
  parseCatalogQuery,
  type CatalogUrlQuery,
} from "@/lib/catalogPagination";
import { parseCatalogSort } from "@/lib/catalogSort";

export type CatalogPageLoadResult = CatalogGridResult & {
  urlQuery?: CatalogUrlQuery;
  categoryMeta?: CategoryBySlugResponse | null;
};

export async function loadCatalogPage(options: {
  basePath: string;
  categorySlug?: string;
  pageRaw?: string;
  qRaw?: string;
  sortRaw?: string;
}): Promise<CatalogPageLoadResult> {
  const page = parseCatalogPage(options.pageRaw);
  const q = parseCatalogQuery(options.qRaw);
  const sort = parseCatalogSort(options.sortRaw);
  const urlQuery = buildCatalogUrlQuery({ q, sort });

  const [result, categoryMeta] = await Promise.all([
    fetchCatalogGrid({
      categorySlug: options.categorySlug,
      page,
      q: q || undefined,
      sort,
    }),
    options.categorySlug
      ? fetchCategoryBySlug(options.categorySlug).catch(() => null)
      : Promise.resolve(null),
  ]);

  const { totalPages } = result.pagination;
  if (totalPages > 0 && page > totalPages) {
    redirect(getCatalogPageHref(options.basePath, totalPages, urlQuery));
  }

  return { ...result, urlQuery, categoryMeta };
}
