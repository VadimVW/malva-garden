export type FigmaStoreNavSection = "shrubs" | "flowers" | "herbs";

export function figmaNavSectionFromCategorySlug(
  slug: string | null | undefined,
): FigmaStoreNavSection | undefined {
  if (!slug) return undefined;
  if (slug === "kvity") return "flowers";
  if (["odnorichni", "bagatorichni", "hrizantemy"].includes(slug)) return "flowers";
  if (slug === "dekoratyvni-kushi") return "shrubs";
  if (["hortenzii", "barbaris", "trojanda", "klimatis"].includes(slug)) return "shrubs";
  if (slug === "dekoratyvni-travy") return "herbs";
  return undefined;
}
