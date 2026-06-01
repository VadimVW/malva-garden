import type { CatalogBreadcrumbItem } from "@/components/store/MalvaGardenCatalogDesktop";
import { catalogPathFromSlugs } from "@/lib/catalogTree";

export const CATALOG_INDEX_HREF = "/catalog";
export const CATALOG_INDEX_LABEL = "Каталог";

export function catalogCategoryHref(
  slug: string,
  breadcrumbs?: { slug: string }[],
): string {
  if (breadcrumbs?.length) {
    return catalogPathFromSlugs(breadcrumbs.map((b) => b.slug));
  }
  return `/catalog/${slug}`;
}

/** Hub-сторінка `/catalog` — перша крихта після головної на листингу й товарі. */
export function catalogIndexBreadcrumb(): CatalogBreadcrumbItem {
  return { label: CATALOG_INDEX_LABEL, href: CATALOG_INDEX_HREF };
}

/** Крихти для `/catalog/...`: Головна → Каталог → … → поточна категорія. */
export function catalogListingBreadcrumbs(
  breadcrumbs: { name: string; slug: string }[],
): CatalogBreadcrumbItem[] {
  const categoryItems: CatalogBreadcrumbItem[] = breadcrumbs.map((b, i) => ({
    label: b.name,
    href:
      i < breadcrumbs.length - 1
        ? catalogCategoryHref(b.slug, breadcrumbs.slice(0, i + 1))
        : undefined,
  }));
  return [catalogIndexBreadcrumb(), ...categoryItems];
}

/** Крихти категорій на сторінці товару (усі з посиланнями). */
export function productCategoryBreadcrumbLinks(
  breadcrumbs: { name: string; slug: string }[],
): { label: string; href: string }[] {
  const index = catalogIndexBreadcrumb();
  const categoryLinks = breadcrumbs.map((b, i) => ({
    label: b.name,
    href: catalogCategoryHref(b.slug, breadcrumbs.slice(0, i + 1)),
  }));
  return [{ label: index.label, href: index.href! }, ...categoryLinks];
}
