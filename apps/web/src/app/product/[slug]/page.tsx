import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getOfflineProductPayload } from "@/lib/offlineDemoProducts";
import MalvaGardenProductDesktop, {
  type MalvaGardenProductPayload,
} from "@/components/figma/MalvaGardenProductDesktop";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: string;
  stockQuantity: number;
  description: string | null;
  careDescription: string | null;
  category: { name: string; slug: string } | null;
  images: { imageUrl: string; altText: string | null; isMain: boolean }[];
};

function toPayload(product: Product): MalvaGardenProductPayload {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    stockQuantity: product.stockQuantity,
    description: product.description,
    careDescription: product.careDescription,
    category: product.category,
    images: product.images.map((img) => ({
      imageUrl: img.imageUrl,
      altText: img.altText,
      isMain: img.isMain,
    })),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let payload: MalvaGardenProductPayload | null = null;
  let preview = false;

  try {
    const product = await apiFetch<Product>(`/products/${slug}`);
    payload = toPayload(product);
  } catch {
    const offline = getOfflineProductPayload(slug);
    if (offline) {
      payload = offline;
      preview = true;
    }
  }

  if (!payload) notFound();

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      <MalvaGardenProductDesktop product={payload} preview={preview} />
    </div>
  );
}
