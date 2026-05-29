import type { CatalogBreadcrumbItem } from "@/components/store/MalvaGardenCatalogDesktop";
import { apiFetch } from "@/lib/api";
import { catalogCategoryHref } from "@/lib/figmaCatalogLinks";

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerImageUrl: string | null;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  hubImageUrl: string | null;
  hubSubtitle: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type CategoryBySlugResponse = {
  category: PublicCategory;
  breadcrumbs: { id: string; name: string; slug: string }[];
};

export async function fetchCategoryBySlug(
  slug: string,
): Promise<CategoryBySlugResponse> {
  return apiFetch<CategoryBySlugResponse>(`/categories/${slug}`);
}

export function breadcrumbsFromCategoryApi(
  breadcrumbs: CategoryBySlugResponse["breadcrumbs"],
): CatalogBreadcrumbItem[] {
  return breadcrumbs.map((b, i) => ({
    label: b.name,
    href:
      i < breadcrumbs.length - 1
        ? catalogCategoryHref(b.slug, breadcrumbs.slice(0, i + 1))
        : undefined,
  }));
}

const DEFAULT_SECTION_DESCRIPTION =
  "Відбірні товари для вашого саду та дому";

export function catalogDesktopPropsFromCategoryMeta(
  meta: CategoryBySlugResponse,
): {
  sectionTitle: string;
  sectionDescription: string;
  bannerImageUrl: string | null;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  breadcrumbs: CatalogBreadcrumbItem[];
  activeRootSlug: string;
} {
  const { category, breadcrumbs } = meta;
  const activeRootSlug = breadcrumbs[0]?.slug ?? category.slug;

  return {
    sectionTitle: category.name,
    sectionDescription:
      category.description?.trim() || DEFAULT_SECTION_DESCRIPTION,
    bannerImageUrl: category.bannerImageUrl,
    bannerTitle: category.bannerTitle,
    bannerSubtitle: category.bannerSubtitle,
    breadcrumbs: breadcrumbsFromCategoryApi(breadcrumbs),
    activeRootSlug,
  };
}
