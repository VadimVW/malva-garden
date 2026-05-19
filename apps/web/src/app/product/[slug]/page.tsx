import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { apiFetch } from "@/lib/api";
import { getOfflineProductPayload } from "@/lib/offlineDemoProducts";
import { buildSeoTitleMetadata } from "@/lib/seo/metadata";
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
  seoTitle: string | null;
  seoDescription: string | null;
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

function mainImageUrl(product: Product): string | null {
  return (
    product.images.find((i) => i.isMain)?.imageUrl ??
    product.images[0]?.imageUrl ??
    null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await apiFetch<Product>(`/products/${slug}`).catch(() => null);
  if (!product) {
    const offline = getOfflineProductPayload(slug);
    if (!offline) return { title: "Товар" };
    return buildSeoTitleMetadata({
      seoTitle: null,
      fallbackTitle: offline.name,
      description: offline.description,
      path: `/product/${slug}`,
      imageUrl: offline.images[0]?.imageUrl ?? null,
    });
  }
  return buildSeoTitleMetadata({
    seoTitle: product.seoTitle,
    fallbackTitle: product.name,
    description:
      product.seoDescription ??
      product.description ??
      `Купити ${product.name} в Malva Garden.`,
    path: `/product/${slug}`,
    imageUrl: mainImageUrl(product),
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let payload: MalvaGardenProductPayload | null = null;
  let preview = false;
  let seoSource: Product | null = null;

  try {
    const product = await apiFetch<Product>(`/products/${slug}`);
    payload = toPayload(product);
    seoSource = product;
  } catch {
    const offline = getOfflineProductPayload(slug);
    if (offline) {
      payload = offline;
      preview = true;
    }
  }

  if (!payload) notFound();

  const imageUrls = payload.images.map((i) => i.imageUrl);

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5]">
      {!preview && seoSource ? (
        <ProductJsonLd
          name={seoSource.name}
          description={seoSource.description}
          slug={seoSource.slug}
          price={seoSource.price}
          stockQuantity={seoSource.stockQuantity}
          imageUrls={imageUrls}
        />
      ) : null}
      <MalvaGardenProductDesktop product={payload} preview={preview} />
    </div>
  );
}
