import { catalogCategoryHref } from "@/lib/figmaCatalogLinks";
import { FIGMA_CATALOG_PATHS } from "@/lib/seo/metadata";
import { seoApiFetch } from "@/lib/seo/api";
import { absoluteUrl } from "@/lib/seo/site";

type CategoryTreeNode = {
  slug: string;
  children?: CategoryTreeNode[];
};

type ProductList = {
  items: { slug: string }[];
  page: number;
  totalPages: number;
};

type PageIndex = {
  items: { slug: string; updatedAt: string }[];
};

function flattenCategorySlugs(nodes: CategoryTreeNode[]): string[] {
  const out: string[] = [];
  for (const node of nodes) {
    out.push(node.slug);
    if (node.children?.length) {
      out.push(...flattenCategorySlugs(node.children));
    }
  }
  return out;
}

async function fetchAllProductSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const data = await seoApiFetch<ProductList>(
      `/products?limit=48&page=${page}`,
    );
    for (const item of data.items) slugs.push(item.slug);
    totalPages = data.totalPages;
    page += 1;
  }
  return slugs;
}

export type SitemapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

export async function collectSitemapEntries(): Promise<SitemapEntry[]> {
  const now = new Date();
  const entries: SitemapEntry[] = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1, lastModified: now },
    {
      url: absoluteUrl("/catalog"),
      changeFrequency: "weekly",
      priority: 0.95,
      lastModified: now,
    },
  ];

  const figmaPaths = new Set(FIGMA_CATALOG_PATHS.map((p) => p.path));
  for (const { path } of FIGMA_CATALOG_PATHS) {
    entries.push({
      url: absoluteUrl(path),
      changeFrequency: "daily",
      priority: path.split("/").length > 3 ? 0.75 : 0.9,
      lastModified: now,
    });
  }

  try {
    const tree = await seoApiFetch<{ items: CategoryTreeNode[] }>("/categories");
    for (const slug of flattenCategorySlugs(tree.items)) {
      const path = catalogCategoryHref(slug);
      if (figmaPaths.has(path)) continue;
      entries.push({
        url: absoluteUrl(path),
        changeFrequency: "weekly",
        priority: 0.7,
        lastModified: now,
      });
    }
  } catch {
    /* API недоступний — лишаємо статичні маршрути */
  }

  try {
    const pages = await seoApiFetch<PageIndex>("/pages");
    for (const page of pages.items) {
      entries.push({
        url: absoluteUrl(`/pages/${page.slug}`),
        changeFrequency: "monthly",
        priority: 0.5,
        lastModified: new Date(page.updatedAt),
      });
    }
  } catch {
    /* без індексу сторінок */
  }

  try {
    const productSlugs = await fetchAllProductSlugs();
    for (const slug of productSlugs) {
      entries.push({
        url: absoluteUrl(`/product/${slug}`),
        changeFrequency: "weekly",
        priority: 0.8,
        lastModified: now,
      });
    }
  } catch {
    /* без товарів */
  }

  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
