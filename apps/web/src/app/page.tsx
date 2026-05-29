import type { Metadata } from "next";
import MalvaGardenHomeDesktop, {
  type HomeLeaderProduct,
} from "@/components/store/MalvaGardenHomeDesktop";
import { apiFetch } from "@/lib/api";
import { homeMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = homeMetadata;

type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  price: string;
  stockQuantity: number;
  category: { id: string; name: string; slug: string } | null;
  images: { imageUrl: string; altText: string | null; isMain: boolean }[];
};

type ProductList = { items: ProductListItem[] };

export default async function HomePage() {
  let leaders: HomeLeaderProduct[] | undefined;
  try {
    const data = await apiFetch<ProductList>("/products?limit=6");
    leaders = data.items.map((p) => ({
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
    }));
  } catch {
    leaders = undefined;
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenHomeDesktop leaderProducts={leaders} />
    </div>
  );
}
