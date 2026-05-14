import type { CatalogGridProduct } from "@/components/figma/MalvaGardenCatalogDesktop";
import { apiFetch } from "@/lib/api";

type ProductListItem = {
  slug: string;
  name: string;
  price: string;
  stockQuantity: number;
  category: { id: string; name: string; slug: string } | null;
  images: { imageUrl: string; altText: string | null; isMain: boolean }[];
};

type ProductList = { items: ProductListItem[] };

export async function fetchCatalogGridProducts(options?: {
  categorySlug?: string;
  limit?: number;
}): Promise<CatalogGridProduct[]> {
  const limit = options?.limit ?? 48;
  const qs = new URLSearchParams({ limit: String(limit) });
  if (options?.categorySlug) qs.set("categorySlug", options.categorySlug);

  const data = await apiFetch<ProductList>(`/products?${qs.toString()}`).catch(() => ({
    items: [] as ProductListItem[],
  }));

  return data.items.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    stockQuantity: p.stockQuantity,
    subtitle: p.category?.name ?? "У каталозі",
    imageUrl:
      p.images?.find((i) => i.isMain)?.imageUrl ??
      p.images?.[0]?.imageUrl ??
      null,
  }));
}
