import type { CatalogGridProduct } from "@/components/figma/MalvaGardenCatalogDesktop";
import type { CatalogPaginationMeta } from "@/lib/catalogPagination";
import { apiFetch } from "@/lib/api";

type ProductListItem = {
  slug: string;
  name: string;
  price: string;
  stockQuantity: number;
  category: { id: string; name: string; slug: string } | null;
  images: { imageUrl: string; altText: string | null; isMain: boolean }[];
};

type ProductListResponse = {
  items: ProductListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CatalogGridResult = {
  products: CatalogGridProduct[];
  pagination: CatalogPaginationMeta;
};

const DEFAULT_LIMIT = 24;

function mapItem(p: ProductListItem): CatalogGridProduct {
  return {
    slug: p.slug,
    name: p.name,
    price: p.price,
    stockQuantity: p.stockQuantity,
    subtitle: p.category?.name ?? "У каталозі",
    imageUrl:
      p.images?.find((i) => i.isMain)?.imageUrl ??
      p.images?.[0]?.imageUrl ??
      null,
  };
}

export async function fetchCatalogGrid(options?: {
  categorySlug?: string;
  page?: number;
  limit?: number;
}): Promise<CatalogGridResult> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options?.categorySlug) qs.set("categorySlug", options.categorySlug);

  const empty: CatalogGridResult = {
    products: [],
    pagination: { page, limit, total: 0, totalPages: 0 },
  };

  try {
    const data = await apiFetch<ProductListResponse>(`/products?${qs.toString()}`);
    return {
      products: data.items.map(mapItem),
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      },
    };
  } catch {
    return empty;
  }
}

/** @deprecated Використовуйте fetchCatalogGrid */
export async function fetchCatalogGridProducts(options?: {
  categorySlug?: string;
  limit?: number;
}): Promise<CatalogGridProduct[]> {
  const result = await fetchCatalogGrid({ ...options, page: 1 });
  return result.products;
}
