"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatPrice, PRODUCT_STATUS_LABELS } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: () => adminFetch<Product[]>("/admin/products"),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return data;
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.slug.toLowerCase().includes(needle),
    );
  }, [data, q]);

  return (
    <>
      <PageHeader
        title="Товари"
        description="Каталог магазину"
        action={
          <Link href="/products/new">
            <Button>Новий товар</Button>
          </Link>
        }
      />
      <div className="mb-4 max-w-md">
        <Input
          placeholder="Пошук за назвою або slug…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <Card className="overflow-hidden">
        {isLoading && (
          <p className="p-6 text-sm text-admin-muted">Завантаження…</p>
        )}
        {error && (
          <p className="p-6 text-sm text-red-600">{(error as Error).message}</p>
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <p className="p-6 text-sm text-admin-muted">Товарів не знайдено.</p>
        )}
        {filtered.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-admin-border bg-gray-50 text-xs uppercase text-admin-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Назва</th>
                <th className="px-4 py-3 font-medium">Категорія</th>
                <th className="px-4 py-3 font-medium">Ціна</th>
                <th className="px-4 py-3 font-medium">Залишок</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-admin-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="font-mono text-xs text-admin-muted">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-admin-muted">
                    {p.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.stockQuantity <= 3 ? "font-medium text-amber-700" : ""
                      }
                    >
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status === "ACTIVE" ? "green" : "gray"}>
                      {PRODUCT_STATUS_LABELS[p.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/products/${p.id}`}
                      className="text-admin-primary hover:underline"
                    >
                      Редагувати
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
