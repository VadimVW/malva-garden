import Link from "next/link";
import type { ReactNode } from "react";
import { apiFetch } from "@/lib/api";

type ProductList = {
  items: { slug: string; name: string; price: string; stockQuantity: number }[];
};

type Tree = { items: unknown };

type Cat = { name: string; slug: string; children?: Cat[] };

function renderCats(cats: Cat[], depth = 0): ReactNode {
  return (
    <ul className={depth ? "ml-4 mt-1 space-y-1 border-l pl-3" : "space-y-1"}>
      {cats.map((c) => (
        <li key={c.slug}>
          <Link
            href={`/catalog/${c.slug}`}
            className="text-emerald-900 hover:underline"
          >
            {c.name}
          </Link>
          {c.children?.length ? renderCats(c.children, depth + 1) : null}
        </li>
      ))}
    </ul>
  );
}

export default async function CatalogPage() {
  const [tree, data] = await Promise.all([
    apiFetch<Tree>("/categories").catch(() => ({ items: [] })),
    apiFetch<ProductList>("/products?limit=48").catch(() => ({
      items: [] as ProductList["items"],
    })),
  ]);

  const items = (tree.items ?? []) as Cat[];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-slate-900">Категорії</h2>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">
            Категорії з’являться після seed.
          </p>
        ) : (
          renderCats(items)
        )}
      </section>
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Усі товари</h1>
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
        {data.items.length === 0 && (
          <p className="text-sm text-slate-500">Товари не знайдені.</p>
        )}
      </section>
    </div>
  );
}
