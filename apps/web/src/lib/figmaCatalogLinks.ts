import { catalogPathFromSlugs } from "@/lib/catalogTree";

export function catalogCategoryHref(
  slug: string,
  breadcrumbs?: { slug: string }[],
): string {
  if (breadcrumbs?.length) {
    return catalogPathFromSlugs(breadcrumbs.map((b) => b.slug));
  }
  return `/catalog/${slug}`;
}

export function catalogHubCrumbFromBreadcrumbs(
  breadcrumbs: { name: string; slug: string }[],
): { label: string; href: string } {
  const root = breadcrumbs[0];
  if (!root) {
    return { label: "Каталог", href: "/catalog" };
  }
  return {
    label: root.name,
    href: catalogPathFromSlugs([root.slug]),
  };
}

/** Чи збігається категорія товару з «кореневою» сторінкою розділу (без дубля крихти). */
export function categorySlugMatchesHub(
  breadcrumbs: { slug: string }[] | null | undefined,
): boolean {
  return Boolean(breadcrumbs && breadcrumbs.length === 1);
}
