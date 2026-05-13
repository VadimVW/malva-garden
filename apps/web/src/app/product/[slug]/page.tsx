import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { AddToCartButton } from "./ui";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: string;
  stockQuantity: number;
  description: string | null;
  careDescription: string | null;
  images: { imageUrl: string; altText: string | null; isMain: boolean }[];
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await apiFetch<Product>(`/products/${slug}`).catch(() => null);
  if (!product) notFound();

  const main =
    product.images.find((i) => i.isMain) ?? product.images[0] ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Link href="/catalog" className="text-sm text-slate-600 hover:underline">
        ← До каталогу
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          {main ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={main.imageUrl}
              alt={main.altText ?? product.name}
              className="w-full rounded border border-slate-200"
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded border border-dashed border-slate-300 text-slate-500">
              Немає фото
            </div>
          )}
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-lg">
            {product.price} грн · наявність: {product.stockQuantity}
          </p>
          <AddToCartButton
            productId={product.id}
            disabled={product.stockQuantity <= 0}
          />
          <p className="text-sm text-slate-500">
            Додавання в кошик через API (токен у браузері).
          </p>
          {product.description && (
            <section>
              <h2 className="font-medium">Опис</h2>
              <p className="text-slate-700">{product.description}</p>
            </section>
          )}
          {product.careDescription && (
            <section>
              <h2 className="font-medium">Догляд</h2>
              <p className="text-slate-700">{product.careDescription}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
