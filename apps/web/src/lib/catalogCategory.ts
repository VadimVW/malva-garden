import type { CatalogBreadcrumbItem } from "@/components/figma/MalvaGardenCatalogDesktop";
import { apiFetch } from "@/lib/api";
import { catalogCategoryHref } from "@/lib/figmaCatalogLinks";
import {
  figmaNavSectionFromCategorySlug,
  type FigmaStoreNavSection,
} from "@/lib/figmaStoreNavSection";

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerImageUrl: string | null;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
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
      i < breadcrumbs.length - 1 ? catalogCategoryHref(b.slug) : undefined,
  }));
}

const SECTION_DESCRIPTION_FALLBACK: Record<FigmaStoreNavSection, string> = {
  flowers: "Відбірні товари для вашого саду та дому",
  shrubs: "Гортензії, троянди та інші декоративні кущі для саду",
  herbs: "Багаторічні та однорічні декоративні трави",
};

export function catalogDesktopPropsFromCategoryMeta(
  meta: CategoryBySlugResponse,
): {
  sectionTitle: string;
  sectionDescription: string;
  bannerImageUrl: string | null;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  breadcrumbs: CatalogBreadcrumbItem[];
  activeNavSection: FigmaStoreNavSection;
} {
  const { category, breadcrumbs } = meta;
  const activeNavSection =
    figmaNavSectionFromCategorySlug(category.slug) ?? "flowers";

  return {
    sectionTitle: category.name,
    sectionDescription:
      category.description?.trim() ||
      SECTION_DESCRIPTION_FALLBACK[activeNavSection],
    bannerImageUrl: category.bannerImageUrl,
    bannerTitle: category.bannerTitle,
    bannerSubtitle: category.bannerSubtitle,
    breadcrumbs: breadcrumbsFromCategoryApi(breadcrumbs),
    activeNavSection,
  };
}
