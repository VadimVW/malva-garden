import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";

type CategoryResp = {
  category: { id: string; name: string; slug: string };
  breadcrumbs: { name: string; slug: string }[];
};

type ProductList = {
  items: { slug: string; name: string; price: string; stockQuantity: number }[];
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = await apiFetch<CategoryResp>(`/categories/${slug}`).catch(
    () => null,
  );
  if (!meta) notFound();

  const data = await apiFetch<ProductList>(
    `/categories/${slug}/products?limit=48`,
  ).catch(() => ({ items: [] as ProductList["items"] }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <nav className="text-sm text-slate-500">
        <Link href="/catalog" className="hover:underline">
          Каталог
        </Link>
        {meta.breadcrumbs.map((b) => (
          <span key={b.slug}>
            {" "}
            /{" "}
            <Link href={`/catalog/${b.slug}`} className="hover:underline">
              {b.name}
            </Link>
          </span>
        ))}
      </nav>
      <h1 className="text-2xl font-semibold">{meta.category.name}</h1>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/product/${p.slug}`}
              className="block rounded border border-slate-200 p-4 hover:border-emerald-700"
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-slate-600">
                {p.price} грн · залишок {p.stockQuantity}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
