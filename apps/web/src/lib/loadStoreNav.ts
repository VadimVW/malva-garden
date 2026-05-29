import {
  buildStoreNavSections,
  fetchCategoryTree,
  type StoreNavSection,
} from "@/lib/catalogTree";

const FALLBACK_NAV: StoreNavSection[] = [
  {
    slug: "dekoratyvni-kushi",
    name: "Декоративні кущі",
    href: "/catalog/dekoratyvni-kushi",
    hubLink: {
      href: "/catalog/dekoratyvni-kushi",
      label: "Усі декоративні кущі",
    },
    children: [],
  },
  {
    slug: "kvity",
    name: "Квіти",
    href: "/catalog/kvity",
    hubLink: { href: "/catalog/kvity", label: "Усі квіти" },
    children: [],
  },
  {
    slug: "dekoratyvni-travy",
    name: "Декоративні трави",
    href: "/catalog/dekoratyvni-travy",
    hubLink: {
      href: "/catalog/dekoratyvni-travy",
      label: "Усі декоративні трави",
    },
    children: [],
  },
];

export async function loadStoreNavSections(): Promise<StoreNavSection[]> {
  try {
    const roots = await fetchCategoryTree();
    if (roots.length === 0) return FALLBACK_NAV;
    return buildStoreNavSections(roots);
  } catch {
    return FALLBACK_NAV;
  }
}
