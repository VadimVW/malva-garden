import type { HomeLeaderProduct } from "@/components/store/MalvaGardenHomeDesktop";
import { apiFetch } from "@/lib/api";

type LeaderProductDto = {
  id: string;
  slug: string;
  name: string;
  price: string;
  stockQuantity: number;
  category: { id: string; name: string; slug: string } | null;
  images: { imageUrl: string; altText: string | null; isMain: boolean }[];
};

type LeadersResponse = { items: LeaderProductDto[] };

function mapLeaderProduct(p: LeaderProductDto): HomeLeaderProduct {
  return {
    id: p.id,
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

export async function loadHomeLeaderProducts(): Promise<
  HomeLeaderProduct[] | undefined
> {
  try {
    const data = await apiFetch<LeadersResponse>("/products/leaders");
    return data.items.map(mapLeaderProduct);
  } catch {
    return undefined;
  }
}
