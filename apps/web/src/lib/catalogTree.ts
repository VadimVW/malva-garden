import { apiFetch } from "@/lib/api";

export type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  hubImageUrl: string | null;
  hubSubtitle: string | null;
  sortOrder: number;
  children: CategoryTreeNode[];
};

export type StoreNavChild = {
  href: string;
  label: string;
};

export type StoreNavSection = {
  slug: string;
  name: string;
  href: string;
  children: StoreNavChild[];
  hubLink: { href: string; label: string };
};

const DEFAULT_HUB_IMAGE = "/images/figma/catalog/hero-kvity.png";

const HUB_IMAGE_CLASS: Record<string, string> = {
  kvity: "object-cover object-[center_22%]",
  "dekoratyvni-kushi": "object-cover object-center",
  "dekoratyvni-travy": "object-cover object-[center_60%]",
};

export function hubImageClassName(slug: string): string {
  return HUB_IMAGE_CLASS[slug] ?? "object-cover object-center";
}

export function catalogPathFromSlugs(slugs: string[]): string {
  if (slugs.length === 0) return "/catalog";
  return `/catalog/${slugs.join("/")}`;
}

export function buildStoreNavSections(roots: CategoryTreeNode[]): StoreNavSection[] {
  return roots.map((root) => ({
    slug: root.slug,
    name: root.name,
    href: catalogPathFromSlugs([root.slug]),
    children: root.children.map((child) => ({
      href: catalogPathFromSlugs([root.slug, child.slug]),
      label: child.name,
    })),
    hubLink: {
      href: catalogPathFromSlugs([root.slug]),
      label: `Усі ${root.name.toLowerCase()}`,
    },
  }));
}

export type CatalogHubSectionContent = {
  href: string;
  title: string;
  description: string;
  imageSrc: string;
  imageClassName: string;
};

export function hubSectionFromRoot(root: CategoryTreeNode): CatalogHubSectionContent {
  return {
    href: catalogPathFromSlugs([root.slug]),
    title: root.name,
    description:
      root.hubSubtitle?.trim() ||
      root.description?.trim() ||
      "",
    imageSrc: root.hubImageUrl?.trim() || DEFAULT_HUB_IMAGE,
    imageClassName: hubImageClassName(root.slug),
  };
}

type TreeSearchResult = {
  node: CategoryTreeNode;
  ancestors: CategoryTreeNode[];
};

function walkTree(
  nodes: CategoryTreeNode[],
  ancestors: CategoryTreeNode[],
  slug: string,
): TreeSearchResult | null {
  for (const node of nodes) {
    if (node.slug === slug) {
      return { node, ancestors };
    }
    const inChild = walkTree(node.children, [...ancestors, node], slug);
    if (inChild) return inChild;
  }
  return null;
}

export function findInCategoryTree(
  roots: CategoryTreeNode[],
  slug: string,
): TreeSearchResult | null {
  return walkTree(roots, [], slug);
}

export function rootSlugForCategory(
  roots: CategoryTreeNode[],
  slug: string,
): string | undefined {
  const found = findInCategoryTree(roots, slug);
  if (!found) return undefined;
  if (found.ancestors.length === 0) return found.node.slug;
  return found.ancestors[0]?.slug;
}

export function slugsFromBreadcrumbs(
  breadcrumbs: { slug: string }[],
): string[] {
  return breadcrumbs.map((b) => b.slug);
}

export function pathsMatchSegments(
  breadcrumbs: { slug: string }[],
  segments: string[],
): boolean {
  const expected = slugsFromBreadcrumbs(breadcrumbs);
  if (expected.length !== segments.length) return false;
  return expected.every((s, i) => s === segments[i]);
}

export async function fetchCategoryTree(): Promise<CategoryTreeNode[]> {
  const data = await apiFetch<{ items: CategoryTreeNode[] }>("/categories");
  return data.items;
}

export function flattenCategoryPaths(
  roots: CategoryTreeNode[],
  ancestors: string[] = [],
): { slug: string; path: string }[] {
  const out: { slug: string; path: string }[] = [];
  for (const node of roots) {
    const slugs = [...ancestors, node.slug];
    const path = catalogPathFromSlugs(slugs);
    out.push({ slug: node.slug, path });
    if (node.children.length) {
      out.push(...flattenCategoryPaths(node.children, slugs));
    }
  }
  return out;
}
