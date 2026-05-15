import { redirect } from "next/navigation";
import { fetchCatalogGrid, type CatalogGridResult } from "@/lib/catalogGridFromApi";
import { getCatalogPageHref, parseCatalogPage } from "@/lib/catalogPagination";

export async function loadCatalogPage(options: {
  basePath: string;
  categorySlug?: string;
  pageRaw?: string;
}): Promise<CatalogGridResult> {
  const page = parseCatalogPage(options.pageRaw);
  const result = await fetchCatalogGrid({
    categorySlug: options.categorySlug,
    page,
  });

  const { totalPages } = result.pagination;
  if (totalPages > 0 && page > totalPages) {
    redirect(getCatalogPageHref(options.basePath, totalPages));
  }

  return result;
}
