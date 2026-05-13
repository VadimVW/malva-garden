import Link from "next/link";
import { apiFetch } from "@/lib/api";

type ProductList = {
  items: { slug: string; name: string; price: string; stockQuantity: number }[];
};

export default async function HomePage() {
  let products: ProductList["items"] = [];
  try {
    const data = await apiFetch<ProductList>("/products?limit=8");
    products = data.items;
  } catch {
    products = [];
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">
          Malva Garden
        </h1>
        <p className="text-slate-600">
          Каркас MVP: каталог, товар, кошик, оформлення. Візуальну верстку зробимо
          після макетів Figma.
        </p>
        <Link
          href="/catalog"
          className="inline-block rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Перейти в каталог
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-slate-900">Приклад товарів</h2>
        {products.length === 0 ? (
          <p className="text-sm text-slate-500">
            Немає даних API. Запустіть Nest, PostgreSQL, міграції та seed.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {products.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/product/${p.slug}`}
                  className="block rounded border border-slate-200 p-4 hover:border-emerald-700"
                >
                  <div className="font-medium text-slate-900">{p.name}</div>
                  <div className="text-sm text-slate-600">
                    {p.price} грн · залишок {p.stockQuantity}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
