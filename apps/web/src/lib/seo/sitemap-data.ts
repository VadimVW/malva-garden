import {
  flattenCategoryPaths,
  type CategoryTreeNode,
} from "@/lib/catalogTree";
import { seoApiFetch } from "@/lib/seo/api";
import { absoluteUrl } from "@/lib/seo/site";

type ProductList = {
  items: { slug: string }[];
  page: number;
  totalPages: number;
};

type PageIndex = {
  items: { slug: string; updatedAt: string }[];
};

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

  try {
    const tree = await seoApiFetch<{ items: CategoryTreeNode[] }>("/categories");
    for (const { path } of flattenCategoryPaths(tree.items)) {
      entries.push({
        url: absoluteUrl(path),
        changeFrequency: "daily",
        priority: path.split("/").length > 3 ? 0.75 : 0.9,
        lastModified: now,
      });
    }
  } catch {
    /* API недоступний */
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
