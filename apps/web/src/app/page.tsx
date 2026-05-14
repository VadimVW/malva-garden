import MalvaGardenHomeDesktop, {
  type HomeLeaderProduct,
} from "@/components/figma/MalvaGardenHomeDesktop";
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

export default async function HomePage() {
  let leaders: HomeLeaderProduct[] | undefined;
  try {
    const data = await apiFetch<ProductList>("/products?limit=6");
    leaders = data.items.map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
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
