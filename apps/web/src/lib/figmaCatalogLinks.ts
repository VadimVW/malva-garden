import {
  figmaNavSectionFromCategorySlug,
  type FigmaStoreNavSection,
} from "@/lib/figmaStoreNavSection";

export function catalogCategoryHref(slug: string): string {
  if (["odnorichni", "bagatorichni", "hrizantemy"].includes(slug)) {
    return `/catalog/kvity/${slug}`;
  }
  if (["hortenzii", "barbaris", "trojanda", "klimatis"].includes(slug)) {
    return `/catalog/dekoratyvni-kushi/${slug}`;
  }
  if (slug === "kvity") return "/catalog/kvity";
  if (slug === "dekoratyvni-kushi") return "/catalog/dekoratyvni-kushi";
  if (slug === "dekoratyvni-travy") return "/catalog/dekoratyvni-travy";
  return `/catalog/${slug}`;
}

export function catalogHubCrumb(categorySlug: string | null | undefined): {
  label: string;
  href: string;
} {
  const sec: FigmaStoreNavSection | undefined =
    figmaNavSectionFromCategorySlug(categorySlug);
  if (sec === "shrubs") {
    return { label: "Декоративні кущі", href: "/catalog/dekoratyvni-kushi" };
  }
  if (sec === "herbs") {
    return { label: "Декоративні трави", href: "/catalog/dekoratyvni-travy" };
  }
  if (sec === "flowers") {
    return { label: "Квіти", href: "/catalog/kvity" };
  }
  if (categorySlug === "ovochi") {
    return { label: "Овочі", href: "/catalog/ovochi" };
  }
  return { label: "Квіти", href: "/catalog/kvity" };
}

/** Чи збігається категорія товару з «кореневою» сторінкою розділу (без дубля крихти). */
export function categorySlugMatchesHub(
  categorySlug: string | null | undefined,
): boolean {
  if (!categorySlug) return false;
  const sec = figmaNavSectionFromCategorySlug(categorySlug);
  if (sec === "flowers" && categorySlug === "kvity") return true;
  if (sec === "shrubs" && categorySlug === "dekoratyvni-kushi") return true;
  if (sec === "herbs" && categorySlug === "dekoratyvni-travy") return true;
  if (categorySlug === "ovochi") return true;
  return false;
}
