import { apiFetch } from "@/lib/api";

export type SearchSuggestion = {
  id: string;
  slug: string;
  name: string;
  price: string;
  categoryName: string | null;
  imageUrl: string | null;
};

type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  price: string;
  category: { name: string } | null;
  images: { imageUrl: string; isMain: boolean }[];
};

type ProductListResponse = {
  items: ProductListItem[];
  total: number;
};

export const SEARCH_SUGGEST_MIN_LENGTH = 2;
export const SEARCH_SUGGEST_LIMIT = 8;
export const SEARCH_SUGGEST_DEBOUNCE_MS = 300;

export async function fetchSearchSuggestions(
  q: string,
  signal?: AbortSignal,
): Promise<{ items: SearchSuggestion[]; total: number }> {
  const trimmed = q.trim();
  if (trimmed.length < SEARCH_SUGGEST_MIN_LENGTH) {
    return { items: [], total: 0 };
  }

  const qs = new URLSearchParams({
    q: trimmed,
    limit: String(SEARCH_SUGGEST_LIMIT),
    page: "1",
  });

  const data = await apiFetch<ProductListResponse>(`/products?${qs}`, { signal });

  return {
    total: data.total,
    items: data.items.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price.includes("грн") ? p.price : `${p.price} грн`,
      categoryName: p.category?.name ?? null,
      imageUrl:
        p.images?.find((i) => i.isMain)?.imageUrl ??
        p.images?.[0]?.imageUrl ??
        null,
    })),
  };
}
